/**
 * Парсер Che168 (Китай) - list-only.
 *
 * Реальность, подтверждённая разведкой (Playwright, ~30 прогонов подряд к
 * реальному сайту - см. историю проекта):
 * 1. che168.com целиком стоит за Tencent EdgeOne (лёгкий JS-cookie
 *    челлендж на КАЖДЫЙ путь, включая /robots.txt) и, дополнительно на
 *    detail-страницах, за капчей 数美 (ShuMei) "安全验证" - интерактивная
 *    капча "кликни иероглифы по порядку", НЕ решается статическим анализом.
 *    Голый axios/curl без исполнения JS проходит защиту в среднем в
 *    ~15% случаев - непригодно для регулярного sync.
 * 2. Playwright (реальный Chromium) проходит лёгкий JS-челлендж сам, без
 *    нашего участия, и достаточно надёжен для СПИСКА объявлений. Detail-
 *    страницы, наоборot, эскалируют в капчу 数美 уже после ~4 быстрых
 *    запросов подряд с одного IP (проверено) - поэтому detail сюда
 *    сознательно не включён: собираем только то, что есть в HTML списка.
 * 3. Список отдаёт немало полей прямо в data-атрибутах карточки (без
 *    похода на detail): brandid/seriesid (числовые ID из общей базы
 *    Autohome - см. chineseDict.js), carname, price (в 万 = 10 000 CNY),
 *    milage (в 万 км), regdate, dealerid, publicdate (ISO, момент первой
 *    публикации - готовый аналог firstAdvertisedDateTime у Encar, не
 *    требует отдельного запроса за датой).
 * 4. Марка/модель не идут текстом вообще - только числовые brandid/seriesid.
 *    Название бренда/модели резолвится через chineseDict.js (общая база
 *    Autohome, не защищена антиботом che168).
 */
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import { translateBrandId, getSeriesName } from '../chineseDict.js';

// Раньше этой даты объявления не собираем (publicdate - момент первой
// публикации конкретной карточки, отдаётся прямо в списке). Совпадает с
// отсечкой Encar - см. parsers/encar.js.
const FIRST_SEEN_CUTOFF = new Date('2026-09-01T00:00:00Z');

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

// Задержки при СЕТЕВОЙ ошибке (таймаут, DNS, page.goto бросил исключение) -
// короткие, как у Encar: это транзиентный сбой, а не блокировка.
const NETWORK_RETRY_DELAYS_MS = [3000, 8000, 15000];

// Задержки при АНТИБОТ-блокировке (капча 数美 или JS-cookie челлендж) -
// здесь короткий retry бессмысленен: по факту проверки блокировка
// привязана к репутации IP и не снимается за секунды. Даём странице
// время "остыть", но не жжём весь sync на заведомо тухлые повторы - если
// после этого всё ещё блок, останавливаем проход и сохраняем прогресс
// для следующего запуска (через 3 часа - см. CRON_SCHEDULE в sync.js).
const CAPTCHA_RETRY_DELAYS_MS = [30000, 90000];

const HARD_FAILURE_PAGES_THRESHOLD = 5; // сетевые сбои/пустые страницы подряд
const CAPTCHA_PAGES_THRESHOLD = 2; // антибот-блокировки подряд (после исчерпания CAPTCHA_RETRY_DELAYS_MS на каждой)

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

let browserPromise = null;
// Резидентский прокси из материкового Китая - НЕ обязателен (текущая защита
// от IP-репутации, а не гео-блокировка по факту - см. историю разведки:
// доступ то давался, то нет с одного и того же не-китайского IP). Если
// понадобится (например, IP Railway тоже начнёт стабильно ловить капчу) -
// достаточно задать PROXY_URL_CN, дальше ничего менять не нужно.
function getBrowser() {
  if (!browserPromise) {
    const proxy = process.env.PROXY_URL_CN ? { server: process.env.PROXY_URL_CN } : undefined;
    // .catch сбрасывает кэш при неудачном launch - иначе браузер long-lived
    // cron-воркера навсегда "застревает" на отклонённом промисе (см. аудит).
    browserPromise = chromium.launch({ headless: true, proxy }).catch((err) => {
      browserPromise = null;
      throw err;
    });
  }
  return browserPromise;
}

async function closeBrowser() {
  if (!browserPromise) return;
  const browser = await browserPromise;
  browserPromise = null;
  await browser.close();
}

/**
 * Загружает одну страницу списка и классифицирует результат:
 * - 'ok'      - реальный список объявлений
 * - 'captcha' - антибот-блокировка (капча 数美 или JS-cookie челлендж
 *               Tencent EdgeOne, недогрузившийся даже после ожидания) -
 *               это НЕ сетевая ошибка, ретраить как сетевую бессмысленно
 * - 'empty'   - страница загрузилась, но карточек нет (конец каталога
 *               либо разовая недогрузка - решает вызывающий код)
 */
async function loadListPage(url) {
  const browser = await getBrowser();
  const context = await browser.newContext({ userAgent: USER_AGENT, locale: 'zh-CN' });
  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('.cards-li[infoid]', { timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const title = await page.title();
    const html = await page.content();
    if (title.includes('安全验证') || (html.length < 3000 && html.includes('EO_Bot_Ssid'))) {
      return { status: 'captcha' };
    }
    if (!html.includes('cards-li')) {
      return { status: 'empty' };
    }
    return { status: 'ok', html };
  } finally {
    await context.close();
  }
}

/**
 * Парсинг одной уже загруженной страницы списка - вся нужная информация
 * лежит в data-атрибутах карточки, см. шапку файла.
 */
export function parseListPage(html) {
  const $ = cheerio.load(html);
  const items = [];
  const cardEls = $('.cards-li[infoid]').toArray();
  // allStale означает "на странице была хотя бы одна карточка, и КАЖДАЯ из
  // них старше отсечки по дате" - только это законный повод считать
  // страницу "хвостом" и досрочно останавливать пагинацию (см.
  // STALE_PAGES_THRESHOLD ниже). Инициализируем true только когда карточки
  // вообще есть - иначе пустая/нераспознанная разметка ошибочно считалась
  // бы "устаревшей" и могла привести к markStaleInactive на не пройденных
  // страницах (см. аудит).
  let allStale = cardEls.length > 0;

  for (const el of cardEls) {
    const $el = $(el);
    const infoId = $el.attr('infoid');
    const carname = ($el.attr('carname') ?? '').trim();
    const priceWan = parseFloat($el.attr('price'));
    const regdate = $el.attr('regdate'); // "2021/07"
    // Без цены/года/названия карточка непригодна для каталога (у cars в БД
    // это NOT NULL поля) - такое на практике встречается у рекламных
    // блоков без infoid (они и так не проходят селектор выше), но на
    // всякий случай пропускаем явно, а не падаем на upsertCar.
    if (!infoId || !carname || !Number.isFinite(priceWan) || !regdate) {
      allStale = false; // некорректная карточка - не свидетельство "устарелости" страницы
      continue;
    }

    const publicDateRaw = $el.attr('publicdate');
    const publicDate = publicDateRaw ? new Date(publicDateRaw) : null;
    if (publicDate && publicDate < FIRST_SEEN_CUTOFF) continue; // старое - пропускаем, allStale не трогаем
    allStale = false; // свежая карточка ИЛИ дата неизвестна - страница не "полностью устаревшая"

    const brandId = Number($el.attr('brandid'));
    const seriesId = Number($el.attr('seriesid'));
    const milageWan = parseFloat($el.attr('milage'));
    const dealerId = $el.attr('dealerid') ?? null;
    const href = $el.find('a').first().attr('href') ?? null;
    const img = $el.find('img').first().attr('src') ?? null;
    // "8.23万公里／2021-07／北京／5年黑金会员" - третий сегмент (после
    // пробега и даты регистрации) - город, текстом на китайском.
    const cardsUnitText = $el.find('.cards-unit').first().text().trim();
    const city = cardsUnitText.split('／')[2]?.trim() || null;

    items.push({
      infoId,
      brandId,
      seriesId,
      carname,
      priceWan,
      milageWan,
      regdate,
      dealerId,
      href,
      img,
      city,
      publicDateRaw,
    });
  }

  return { items, allStale };
}

/**
 * @param {object} raw - одна карточка из parseListPage
 */
export async function normalizeChe168Item(raw) {
  const brand = translateBrandId(raw.brandId) ?? String(raw.brandId);
  const seriesName = await getSeriesName(raw.brandId, raw.seriesId);

  // carname обычно вида "<модель> <ГГГГ>款 <комплектация>" - саму модель
  // надёжнее брать из словаря (см. chineseDict.js), а из carname достаточно
  // хвоста после "ГГГГ款" как строки комплектации/trim.
  const trimMatch = raw.carname.match(/^.*?\d{4}款\s*(.*)$/);
  const trim = trimMatch && trimMatch[1] ? trimMatch[1].trim() : null;

  const yearMatch = raw.regdate.match(/^(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : null;
  if (!year) return null; // year NOT NULL в БД - без него объявление непригодно

  const url = raw.href
    ? raw.href.startsWith('http')
      ? raw.href
      : `https://www.che168.com${raw.href}`
    : `https://www.che168.com/`;
  const photo = raw.img ? (raw.img.startsWith('http') ? raw.img : `https:${raw.img}`) : null;

  return {
    source: 'che168',
    source_id: raw.infoId,
    brand,
    model: seriesName ?? raw.carname,
    trim,
    year,
    city: raw.city ?? null,
    mileage_km: Number.isFinite(raw.milageWan) ? Math.round(raw.milageWan * 10000) : null,
    fuel_type: null, // недоступно в списке (только на detail, куда сознательно не ходим - см. шапку файла)
    transmission: null,
    engine_volume: null,
    power_hp: null,
    color: null,
    price_origin: Math.round(raw.priceWan * 10000), // 万 = 10 000 CNY; round - иначе плавающая точка (17.49*10000) даёт 174899.99999999997
    currency: 'CNY',
    photos: photo ? [photo] : [],
    url,
    raw: { ...raw },
    vin: null, // Che168 не публикует VIN/车架号 анонимно - см. историю разведки
    body_type: null,
    accident_info: null,
    seizing_info: null,
    warranty_info: null,
    origin_price: null,
    options: [],
    registered_at: raw.publicDateRaw ?? null,
    encar_verified: null,
    inspection_report: null,
    inspection_report_url: null,
  };
}

/**
 * Постранично тянет список(-и) объявлений через Playwright.
 *
 * @param {object} opts
 * @param {string[]} opts.listUrlTemplates - шаблоны URL с плейсхолдером
 *   "{page}" вместо номера страницы, например:
 *   'https://www.che168.com/china/a0_0msdgscncgpi1lto8csp{page}exx0/'
 *   (lto8 = сортировка "最新发布"/новые сначала - нужна для раннего выхода
 *   по дате, см. STALE_PAGES_THRESHOLD ниже).
 * @param {(items: object[], page: number) => Promise<void>} [opts.onPage]
 * @param {number} [opts.maxPages] - жёсткий потолок страниц (у che168 и так
 *   не более 100 страниц на фильтр - ограничение самого сайта)
 * @param {number} [opts.startPage] - с какой страницы продолжить (resume
 *   после сбоя - см. sync.js)
 */
export async function fetchAllChe168({ listUrlTemplates = [], onPage, maxPages = 100, startPage = 1 } = {}) {
  if (listUrlTemplates.length === 0) return;

  // Список отсортирован по publicdate (новые сначала, см. lto8 в шаблоне
  // URL) - монотонность надёжнее, чем у Encar (там сортировка по
  // ModifiedDate и дилерские "поднятия" сбивают порядок), поэтому порог
  // ниже (3 против 4 у Encar) достаточен.
  const STALE_PAGES_THRESHOLD = 3;

  try {
    for (const [templateIndex, template] of listUrlTemplates.entries()) {
      let consecutiveStalePages = 0;
      let consecutiveHardFailures = 0;
      let consecutiveCaptchaPages = 0;
      // startPage - это resume-курсор ДЛЯ ОДНОГО прогона одного источника
      // (см. sync_progress в schema.sql - ключ только "che168", без привязки
      // к шаблону), поэтому осмысленно применим он только к первому шаблону
      // в списке; остальные всегда начинаются с 1 - иначе при нескольких
      // URL-шаблонах resume после сбоя молча пропускал бы первые страницы
      // всех шаблонов, кроме того, на котором произошёл сбой (см. аудит).
      const templateStartPage = templateIndex === 0 ? startPage : 1;

      for (let page = templateStartPage; page <= maxPages; page++) {
        const url = template.replace('{page}', String(page));
        let result;

        // --- одна страница, сетевые сбои ретраим отдельно от блокировок ---
        for (let attempt = 0; ; attempt++) {
          try {
            result = await loadListPage(url);
            break;
          } catch (e) {
            if (attempt < NETWORK_RETRY_DELAYS_MS.length) {
              console.warn(`[che168] страница ${page}: сетевая ошибка (попытка ${attempt + 1}) - ${e.message}, повтор через ${NETWORK_RETRY_DELAYS_MS[attempt]}мс`);
              await sleep(NETWORK_RETRY_DELAYS_MS[attempt]);
              continue;
            }
            throw Object.assign(new Error(`Che168: сетевая ошибка на странице ${page} после ${NETWORK_RETRY_DELAYS_MS.length + 1} попыток - ${e.message}`), { failedAtPage: page });
          }
        }

        if (result.status === 'captcha') {
          for (let captchaAttempt = 0; result.status === 'captcha' && captchaAttempt < CAPTCHA_RETRY_DELAYS_MS.length; captchaAttempt++) {
            console.warn(`[che168] страница ${page}: антибот-блокировка (капча/челлендж), попытка ${captchaAttempt + 1}, жду ${CAPTCHA_RETRY_DELAYS_MS[captchaAttempt]}мс`);
            await sleep(CAPTCHA_RETRY_DELAYS_MS[captchaAttempt]);
            result = await loadListPage(url).catch(() => ({ status: 'captcha' }));
          }
        }

        if (result.status === 'captcha') {
          consecutiveCaptchaPages++;
          consecutiveHardFailures = 0;
          console.error(`[che168] страница ${page}: всё ещё заблокировано после ${CAPTCHA_RETRY_DELAYS_MS.length} повторов - похоже на устойчивую блокировку IP, а не разовый сбой`);
          if (consecutiveCaptchaPages >= CAPTCHA_PAGES_THRESHOLD) {
            throw Object.assign(new Error(`Che168: ${CAPTCHA_PAGES_THRESHOLD} страниц подряд заблокированы антиботом, останавливаю проход на странице ${page}`), { failedAtPage: page });
          }
          continue;
        }
        consecutiveCaptchaPages = 0;

        if (result.status === 'empty') {
          consecutiveHardFailures++;
          if (consecutiveHardFailures >= HARD_FAILURE_PAGES_THRESHOLD) {
            // Чистый выход, а не throw: серия пустых страниц у че168 в
            // подавляющем большинстве случаев - это конец каталога фильтра
            // (у общего "all-China" URL страница 100 - жёсткий потолок сайта
            // раньше сюда дойти не даёт, но у более узких URL по
            // бренду/городу конец каталога наступает раньше). throw здесь
            // означал бы, что sync.js никогда не увидит completedFully и
            // sync_progress навсегда зависнет на этой странице (см. аудит).
            console.log(`[che168] ${HARD_FAILURE_PAGES_THRESHOLD} страниц подряд без карточек - считаю концом каталога, выхожу на странице ${page}`);
            break;
          }
          continue;
        }
        consecutiveHardFailures = 0;

        // status === 'ok'
        const { items: rawItems, allStale } = parseListPage(result.html);
        const items = [];
        for (const rawItem of rawItems) {
          const item = await normalizeChe168Item(rawItem);
          if (item) items.push(item);
        }

        if (onPage && items.length > 0) await onPage(items, page);

        consecutiveStalePages = allStale ? consecutiveStalePages + 1 : 0;
        if (consecutiveStalePages >= STALE_PAGES_THRESHOLD) {
          console.log(`[che168] ${STALE_PAGES_THRESHOLD} страницы подряд старше отсечки по дате - останавливаю пагинацию раньше времени`);
          break;
        }

        await sleep(2000); // не долбить чаще, чем реально нужно
      }
    }
  } finally {
    await closeBrowser();
  }
}
