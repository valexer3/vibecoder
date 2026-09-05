import 'dotenv/config';
import cron from 'node-cron';
import { fetchAllEncar } from './parsers/encar.js';
import { fetchAllChe168 } from './parsers/che168.js';
import { upsertCar, markStaleInactive, getFxRate, pool } from './db.js';
import { calculatePriceRub } from './pricing.js';

const CHE168_LIST_URLS = [
  // Добавь сюда конкретные листинговые URL che168 по нужным маркам/городам
  // 'https://www.che168.com/china/a0_0msdgscncgpi1ltocsp1exx0/',
];

async function syncEncar() {
  console.log('[sync] Encar: старт');
  const krwRate = await getFxRate('KRW');
  if (krwRate == null) {
    console.warn('[sync] Encar: курс KRW не найден в fx_rates - price_rub НЕ будет посчитан (запусти обновление курсов)');
  }
  const ids = [];
  let total = 0;
  // Пишем в БД постранично (onPage), а не после накопления всего каталога -
  // при 200k+ объявлениях полный проход занимает часы, и без этого
  // last_seen_at/новые машины не появлялись бы в БД до самого конца цикла.
  await fetchAllEncar({
    limit: 20,
    onPage: async (items) => {
      for (const car of items) {
        car.price_rub = krwRate != null ? calculatePriceRub(car.price_origin, krwRate) : null;
        await upsertCar(car);
        ids.push(car.source_id);
      }
      total += items.length;
      console.log(`[sync] Encar: обработано ${total} объявлений...`);
    },
  });
  await markStaleInactive('encar', ids);
  console.log(`[sync] Encar: готово, объявлений: ${total}`);
}

async function syncChe168() {
  if (CHE168_LIST_URLS.length === 0) {
    console.log('[sync] Che168: пропущено (не заданы CHE168_LIST_URLS)');
    return;
  }
  console.log('[sync] Che168: старт');
  const items = await fetchAllChe168(CHE168_LIST_URLS);
  const ids = [];
  for (const car of items) {
    if (!car.source_id) continue;
    await upsertCar(car);
    ids.push(car.source_id);
  }
  await markStaleInactive('che168', ids);
  console.log(`[sync] Che168: готово, объявлений: ${items.length}`);
}

// ЦБ РФ официально не публикует курс южнокорейской воны (KRW), поэтому курсы
// берём с open.er-api.com (бесплатно, без ключа). Ответ отдаёт rates.KRW/rates.CNY
// как "сколько иностранной валюты за 1 рубль" - инвертируем (1 / rate), чтобы
// получить рублей за 1 единицу валюты источника.
async function syncFx() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/RUB');
    const data = await res.json();
    if (data?.result !== 'success' || !data?.rates) {
      throw new Error(`Неожиданный ответ open.er-api.com: ${JSON.stringify(data).slice(0, 200)}`);
    }
    const { KRW, CNY } = data.rates;

    if (CNY) {
      const rubPerCny = 1 / CNY;
      await pool.query(
        `INSERT INTO fx_rates (currency, rub_rate, updated_at) VALUES ('CNY', $1, now())
         ON CONFLICT (currency) DO UPDATE SET rub_rate = $1, updated_at = now()`,
        [rubPerCny]
      );
      console.log(`[sync] Курс CNY обновлён: 1 CNY = ${rubPerCny.toFixed(4)} ₽`);
    }
    if (KRW) {
      const rubPerKrw = 1 / KRW;
      await pool.query(
        `INSERT INTO fx_rates (currency, rub_rate, updated_at) VALUES ('KRW', $1, now())
         ON CONFLICT (currency) DO UPDATE SET rub_rate = $1, updated_at = now()`,
        [rubPerKrw]
      );
      console.log(`[sync] Курс KRW обновлён: 1 KRW = ${rubPerKrw.toFixed(6)} ₽`);
    }
    console.log('[sync] Курсы валют обновлены');
  } catch (e) {
    console.warn('[sync] Не удалось обновить курсы:', e.message);
  }
}

async function runAll() {
  await syncFx();
  await syncEncar();
  await syncChe168();
}

if (process.argv.includes('--once')) {
  runAll().then(() => process.exit(0));
} else {
  cron.schedule(process.env.CRON_SCHEDULE || '0 */3 * * *', runAll);
  console.log('[sync] Планировщик запущен:', process.env.CRON_SCHEDULE || '0 */3 * * *');
  runAll();
}
