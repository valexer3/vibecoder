import 'dotenv/config';
import cron from 'node-cron';
import { fetchAllEncar } from './parsers/encar.js';
import { fetchAllChe168 } from './parsers/che168.js';
import { upsertCar, markStaleInactive, getFxRate, pool, getSyncProgress, setSyncProgress, clearSyncProgress } from './db.js';
import { calculatePriceRub } from './pricing.js';

// "{page}" - плейсхолдер номера страницы (см. fetchAllChe168 в
// parsers/che168.js). lto8 в URL - сортировка "最新发布" (новые сначала) -
// нужна для раннего выхода по дате публикации, аналогично сортировке
// Encar по ModifiedDate.
const CHE168_LIST_URLS = [
  'https://www.che168.com/china/a0_0msdgscncgpi1lto8csp{page}exx0/',
];

async function syncEncar() {
  console.log('[sync] Encar: старт');
  const krwRate = await getFxRate('KRW');
  if (krwRate == null) {
    console.warn('[sync] Encar: курс KRW не найден в fx_rates - price_rub НЕ будет посчитан (запусти обновление курсов)');
  }
  const ids = [];
  let total = 0;
  const startPage = await getSyncProgress('encar');
  if (startPage > 0) {
    console.log(`[sync] Encar: продолжаю с сохранённого прогресса - страница ${startPage} (предыдущий проход прервался из-за сбоя)`);
  }
  // Пишем в БД постранично (onPage), а не после накопления всего каталога -
  // при 200k+ объявлениях полный проход занимает часы, и без этого
  // last_seen_at/новые машины не появлялись бы в БД до самого конца цикла.
  const maxItems = process.env.SYNC_MAX_ITEMS ? Number(process.env.SYNC_MAX_ITEMS) : undefined;
  let completedFully = false;
  try {
    await fetchAllEncar({
      limit: 20,
      maxItems,
      startPage,
      onPage: async (items, page) => {
        for (const car of items) {
          try {
            car.price_rub = krwRate != null ? calculatePriceRub(car.price_origin, krwRate) : null;
            await upsertCar(car);
            ids.push(car.source_id);
          } catch (e) {
            // Одно кривое объявление не должно убивать всю страницу/проход -
            // логируем и переходим к следующему.
            console.error(`[sync] Encar: не удалось сохранить объявление ${car.source_id}: ${e.message}`);
          }
        }
        total += items.length;
        console.log(`[sync] Encar: обработано ${total} объявлений...`);
        await setSyncProgress('encar', page + 1);
      },
    });
    // Проход завершился штатно (конец каталога либо ранний выход по дате) -
    // сбрасываем прогресс, следующий цикл снова начнёт со страницы 0.
    await clearSyncProgress('encar');
    completedFully = true;
  } catch (e) {
    // Сюда попадаем только при HARD_FAILURE_PAGES_THRESHOLD подряд неудачных
    // страниц (см. parsers/encar.js) - прогресс уже сохранён на последней
    // успешной странице, следующий запуск продолжит с неё.
    console.error(`[sync] Encar: проход прерван - ${e.message}`);
  }
  // markStaleInactive гасит is_active у ВСЕГО, чего нет в ids - корректно
  // только когда проход реально прошёл весь актуальный каталог (или дошёл
  // до раннего выхода по дате). При тестовом SYNC_MAX_ITEMS или при обрыве
  // из-за сбоя API ids - лишь маленький кусок каталога, и вызов здесь
  // ошибочно погасил бы почти все остальные машины (это уже случалось).
  if (completedFully && maxItems == null) {
    await markStaleInactive('encar', ids);
  } else {
    console.log('[sync] Encar: markStaleInactive пропущен (неполный/тестовый проход)');
  }
  console.log(`[sync] Encar: готово, объявлений: ${total}`);
}

async function syncChe168() {
  if (CHE168_LIST_URLS.length === 0) {
    console.log('[sync] Che168: пропущено (не заданы CHE168_LIST_URLS)');
    return;
  }
  console.log('[sync] Che168: старт');
  const cnyRate = await getFxRate('CNY');
  if (cnyRate == null) {
    console.warn('[sync] Che168: курс CNY не найден в fx_rates - price_rub НЕ будет посчитан (запусти обновление курсов)');
  }
  const ids = [];
  let total = 0;
  const startPage = await getSyncProgress('che168');
  if (startPage > 1) {
    console.log(`[sync] Che168: продолжаю с сохранённого прогресса - страница ${startPage} (предыдущий проход прервался из-за сбоя/блокировки)`);
  }
  const maxItems = process.env.SYNC_MAX_ITEMS ? Number(process.env.SYNC_MAX_ITEMS) : undefined;
  let completedFully = false;
  try {
    await fetchAllChe168({
      listUrlTemplates: CHE168_LIST_URLS,
      startPage: startPage > 1 ? startPage : 1,
      maxItems,
      onPage: async (items, page) => {
        for (const car of items) {
          try {
            car.price_rub = cnyRate != null ? calculatePriceRub(car.price_origin, cnyRate) : null;
            await upsertCar(car);
            ids.push(car.source_id);
          } catch (e) {
            console.error(`[sync] Che168: не удалось сохранить объявление ${car.source_id}: ${e.message}`);
          }
        }
        total += items.length;
        console.log(`[sync] Che168: обработано ${total} объявлений...`);
        await setSyncProgress('che168', page + 1);
      },
    });
    // Проход завершился штатно (конец каталога либо ранний выход по дате) -
    // сбрасываем прогресс, следующий цикл снова начнёт со страницы 1.
    await clearSyncProgress('che168');
    completedFully = true;
  } catch (e) {
    // Сюда попадаем при устойчивой антибот-блокировке или серии сетевых
    // сбоев подряд (см. CAPTCHA_PAGES_THRESHOLD/HARD_FAILURE_PAGES_THRESHOLD
    // в parsers/che168.js) - прогресс уже сохранён на последней успешной
    // странице, следующий запуск (через 3 часа) продолжит с неё.
    console.error(`[sync] Che168: проход прерван - ${e.message}`);
  }
  // Как и у Encar - markStaleInactive корректен только когда проход реально
  // дошёл до конца каталога (или до раннего выхода по дате), а не оборвался
  // на части страниц из-за блокировки/сбоя. При тестовом SYNC_MAX_ITEMS ids -
  // тоже лишь маленький кусок каталога (проход останавливается досрочно по
  // достижении лимита, а не по концу каталога), поэтому исключаем и его -
  // иначе тестовый прогон на 10 объявлений погасил бы is_active почти у
  // всего остального каталога Che168.
  if (completedFully && maxItems == null) {
    await markStaleInactive('che168', ids);
  } else {
    console.log('[sync] Che168: markStaleInactive пропущен (неполный/тестовый проход)');
  }
  console.log(`[sync] Che168: готово, объявлений: ${total}`);
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

// Encar и Che168 теперь развёрнуты как ДВА отдельных Railway-сервиса
// (основной vibecoder + отдельный che168-сервис - последний нужен, чтобы
// Che168 не делил IP/сетевую репутацию с Encar-трафиком и не проходил их
// планировщик синхронно). SYNC_SOURCE говорит, какой источник обслуживает
// текущий процесс - без неё (например, локально) оба идут вместе, как
// раньше, поэтому дефолт 'all' сохраняет старое поведение.
const SYNC_SOURCE = process.env.SYNC_SOURCE || 'all'; // 'encar' | 'che168' | 'all'

async function runAll() {
  // Курсы валют дешёвые и нужны обоим сервисам (каждый считает price_rub
  // только для своего источника, но оба сервиса должны видеть свежий курс
  // своей валюты) - поэтому syncFx выполняется независимо от SYNC_SOURCE.
  await syncFx();
  if (SYNC_SOURCE === 'encar' || SYNC_SOURCE === 'all') {
    try {
      await syncEncar();
    } catch (e) {
      console.error('[sync] Encar: непредвиденная ошибка верхнего уровня -', e.message);
    }
  }
  if (SYNC_SOURCE === 'che168' || SYNC_SOURCE === 'all') {
    try {
      await syncChe168();
    } catch (e) {
      console.error('[sync] Che168: непредвиденная ошибка верхнего уровня -', e.message);
    }
  }
}

if (process.argv.includes('--once')) {
  runAll().then(() => process.exit(0));
} else {
  cron.schedule(process.env.CRON_SCHEDULE || '0 */3 * * *', runAll);
  console.log('[sync] Планировщик запущен:', process.env.CRON_SCHEDULE || '0 */3 * * *');
  runAll();
}
