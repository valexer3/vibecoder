/**
 * Парсер Che168 (Китай) - товар куда более капризный, чем Encar.
 *
 * Реальность, с которой стоит считаться до найма разработчика под это:
 * 1. Che168 отдаёт основной список объявлений через JS-рендеринг
 *    (данные подгружаются XHR-запросами к скрытым эндпоинтам, которые
 *    периодически меняют подпись/токен запроса). Голым axios+cheerio
 *    иногда можно вытащить только first-render HTML без реальных карточек.
 * 2. Практически со 100% вероятностью нужен IP из материкового Китая
 *    (резидентские прокси) - без него отдаётся страница-заглушка или 403.
 * 3. Поэтому самый устойчивый вариант в проде - headless-браузер
 *    (Playwright/Puppeteer) с CN-прокси, а не прямой HTTP-запрос.
 *
 * Ниже - рабочий каркас на axios+cheerio для случаев, когда нужен именно
 * лёгкий вариант (напр. точечный парсинг конкретной карточки по ссылке,
 * когда JS уже не критичен), плюс место, куда встраивается Playwright,
 * если понадобится полноценный список.
 */
import axios from 'axios';
import * as cheerio from 'cheerio';
import { HttpsProxyAgent } from 'https-proxy-agent';

function client() {
  const agent = process.env.PROXY_URL_CN
    ? new HttpsProxyAgent(process.env.PROXY_URL_CN)
    : undefined;

  return axios.create({
    httpAgent: agent,
    httpsAgent: agent,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile Safari/604.1',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      Referer: 'https://www.che168.com/',
    },
    timeout: 15000,
  });
}

/**
 * Парсинг одной страницы списка (по марке/городу).
 * listUrl пример: https://www.che168.com/china/a0_0msdgscncgpi1ltocsp1exx0/
 * Если сервер вернёт страницу без данных (типично для che168 без CN-IP/без
 * рендеринга JS), функция вернёт пустой массив - это ожидаемо, см. шапку файла.
 */
export async function fetchChe168ListPage(listUrl) {
  const { data: html } = await client().get(listUrl);
  const $ = cheerio.load(html);
  const items = [];

  // Селекторы условны - актуальную вёрстку нужно сверить вживую перед
  // продакшн-запуском, т.к. che168 периодически меняет разметку.
  $('.list-item, .cxc-card').each((_, el) => {
    const $el = $(el);
    const title = $el.find('.card-name, .title').first().text().trim();
    const priceText = $el.find('.price, .lprice').first().text().trim();
    const href = $el.find('a').first().attr('href');
    const img = $el.find('img').first().attr('data-src') || $el.find('img').first().attr('src');

    if (!title || !href) return;

    items.push({
      source: 'che168',
      source_id: (href.match(/\/(\d+)\.html?/) || [])[1] || href,
      titleRaw: title,
      price_origin: parseFloat((priceText.match(/[\d.]+/) || ['0'])[0]) * 10000, // цена часто в 万 (10 000 CNY)
      currency: 'CNY',
      photos: img ? [img.startsWith('http') ? img : `https:${img}`] : [],
      url: href.startsWith('http') ? href : `https://www.che168.com${href}`,
      raw: { title, priceText },
    });
  });

  return items.map(normalizeChe168Item);
}

function normalizeChe168Item(item) {
  // Заголовок объявлений che168 обычно вида "2022款 宝马X5 xDrive30i" -
  // марку/модель придётся разбирать отдельным словарём бренд->латиница,
  // т.к. они на китайском. Здесь - минимальная заглушка под доработку.
  const yearMatch = item.titleRaw.match(/(20\d{2})/);
  return {
    source: item.source,
    source_id: item.source_id,
    brand: null, // TODO: сопоставить через словарь китайских названий брендов
    model: item.titleRaw,
    trim: null,
    year: yearMatch ? parseInt(yearMatch[1], 10) : null,
    mileage_km: null,
    fuel_type: null,
    transmission: null,
    engine_volume: null,
    power_hp: null,
    color: null,
    price_origin: item.price_origin,
    currency: item.currency,
    photos: item.photos,
    url: item.url,
    raw: item.raw,
  };
}

/**
 * Место для Playwright-варианта (рекомендуемый путь для реального объёма):
 *
 *   import { chromium } from 'playwright';
 *   const browser = await chromium.launch({ proxy: { server: process.env.PROXY_URL_CN } });
 *   const page = await browser.newPage();
 *   await page.goto(listUrl, { waitUntil: 'networkidle' });
 *   const items = await page.$$eval('.list-item', els => ...);
 *
 * Осознанно не включаю Playwright в базовый набор зависимостей, чтобы не
 * раздувать деплой на Railway по умолчанию - подключить одной командой,
 * когда прокси будут готовы: npm i playwright && npx playwright install chromium
 */
export async function fetchAllChe168(listUrls = []) {
  const all = [];
  for (const url of listUrls) {
    try {
      const items = await fetchChe168ListPage(url);
      all.push(...items);
    } catch (e) {
      console.warn(`[che168] не удалось получить ${url}:`, e.message);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return all;
}
