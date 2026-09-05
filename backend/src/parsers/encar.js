/**
 * Парсер Encar (Корея).
 * У Encar есть полуоткрытый JSON API, которым пользуется их же сайт-поиск,
 * поэтому реального "скрейпинга HTML" не требуется - достаточно бить в
 * api.encar.com напрямую с нужными заголовками (Referer/Origin обязательны,
 * иначе 403). Домен уже подсказывает структуру: action=(area/vc)...
 *
 * ВАЖНО:
 * - Encar иногда просит капчу/меняет формат ответа при подозрительной
 *   активности - делай запросы не чаще 1 раз в 1-2 сек и меняй User-Agent.
 * - Для тяжёлого объёма (тысячи объявлений/день) рекомендуется поставить
 *   IP из Кореи (VPS/прокси) - без него встречаются региональные блокировки.
 */
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { translateBrand, translateModel, translateWords, translateFuelType } from '../koreanDict.js';

// general = полный каталог (частники + дилеры), premium = только дилеры-партнёры
const BASE = 'https://api.encar.com/search/car/list/general';
// Детальная карточка объявления - список отдаёт только 4 превью-фото в
// SearchResults[].Photos, полная галерея (10-30+ фото) доступна только тут.
const DETAIL_BASE = 'https://api.encar.com/v1/readside/vehicle';

function client() {
  const agent = process.env.PROXY_URL_KR
    ? new HttpsProxyAgent(process.env.PROXY_URL_KR)
    : undefined;

  return axios.create({
    httpAgent: agent,
    httpsAgent: agent,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      Referer: 'https://www.encar.com/',
      Origin: 'https://www.encar.com',
    },
    timeout: 15000,
  });
}

// Encar использует Q-язык для фильтров, например:
// (And.Hidden.N._.CarType.A._.(C.CarType.Y._.C.CarType.N.))
// Для базового каталога достаточно "все легковые, не скрытые".
// Регион продавца намеренно НЕ фильтруем - берём каталог целиком по всей Корее,
// фильтр по региону добавляется отдельным шагом позже.
const DEFAULT_QUERY =
  '(And.Hidden.N._.CarType.A.)';

/**
 * @param {object} opts
 * @param {number} opts.page - страница (0-based)
 * @param {number} opts.limit - размер страницы (max ~20 у Encar)
 * @param {string} [opts.brand] - фильтр по марке (латиницей, как на encar)
 * @returns {Promise<{items: object[], total: number|null}>}
 */
export async function fetchEncarPage({ page = 0, limit = 20, brand } = {}) {
  const q = brand
    ? `(And.Hidden.N._.CarType.A._.(C.Manufacturer.${brand}.))`
    : DEFAULT_QUERY;

  const params = {
    count: true,
    q,
    sr: `|ModifiedDate|${page * limit}|${limit}`,
  };

  const { data } = await client().get(BASE, { params });
  // data.SearchResults: массив карточек, data.Count: общее число объявлений по фильтру
  const items = (data?.SearchResults ?? []).map(normalizeEncarItem);

  // Список отдаёт только 4 превью-фото на объявление - догружаем полную
  // галерею с детальной карточки каждого объявления (без ограничения по
  // числу фото). Если детальный запрос не удался - остаются превью-фото
  // из списка как fallback, синхронизацию это не прерывает.
  for (const item of items) {
    const fullPhotos = await fetchEncarPhotos(item.source_id);
    if (fullPhotos && fullPhotos.length > 0) item.photos = fullPhotos;
    await new Promise((r) => setTimeout(r, 300));
  }

  return {
    items,
    total: typeof data?.Count === 'number' ? data.Count : null,
  };
}

/**
 * Полная галерея фото объявления с детальной карточки (без ограничения).
 *
 * Важно: detail-эндпоинт отдаёт photos[] в произвольном (не отсортированном
 * по смыслу) порядке - иногда первым элементом оказывается фото из салона,
 * руля или ремонтных работ. Зато у каждого фото здесь есть поле `type` с
 * реальной категорией: "OUTER" (кузов), "INNER" (салон), "OPTION" (детали/
 * доп. фото), "DIAG2" (фото для диагностики техсостояния), "THUMBNAIL"
 * (дубли уже присутствующих фото под другой crop-код, по факту повторяют
 * path других записей). Подтверждено вручную на реальных ответах API
 * (см. backend/src/encar_probe.mjs, backend/src/encar_probe2.mjs) на
 * нескольких объявлениях подряд - схема стабильна.
 *
 * Список-эндпоинт (normalizeEncarItem) такого признака НЕ отдаёт вообще -
 * там только числовой код фото без категории, поэтому сортировку по типу
 * можно сделать только здесь, на детальной карточке.
 */
export async function fetchEncarPhotos(id) {
  try {
    const { data } = await client().get(`${DETAIL_BASE}/${id}`);
    const photos = Array.isArray(data?.photos) ? data.photos : [];
    if (photos.length === 0) return null;

    const byCodeAsc = (a, b) => Number(a.code) - Number(b.code);
    // Экстерьер - вперёд и по возрастанию code (это соответствует порядку
    // съёмки: перед/бок/зад), остальное (кроме THUMBNAIL-дублей) - следом.
    const outer = photos.filter((p) => p.type === 'OUTER').sort(byCodeAsc);
    const rest = photos.filter((p) => p.type !== 'OUTER' && p.type !== 'THUMBNAIL').sort(byCodeAsc);
    const ordered = [...outer, ...rest];

    if (ordered.length === 0) return null;
    return ordered.map((p) => `https://ci.encar.com/carpicture${p.path}`);
  } catch (e) {
    console.warn(`[encar] не удалось получить фото объявления ${id}: ${e.message}`);
  }
  return null;
}

export function normalizeEncarItem(item) {
  // Превью из списка (до похода на детальную карточку в fetchEncarPage) -
  // используется как fallback, если детальный запрос не удастся.
  // ВАЖНО: у item.Photos[].type здесь просто числовой код фото (совпадает
  // с полем `code` детальной карточки), а НЕ категория "экстерьер/салон" -
  // в отличие от одноимённого поля `type` в detail-ответе (см. fetchEncarPhotos).
  // На проверенных объявлениях список всегда приходит уже по возрастанию
  // ordering (и code 001 у Encar стабильно оказывается экстерьером), но
  // сортируем явно, а не полагаемся на порядок ответа API.
  const photos = Array.isArray(item.Photos) && item.Photos.length > 0
    ? [...item.Photos].sort((a, b) => a.ordering - b.ordering).map((p) => `https://ci.encar.com/carpicture${p.location}`)
    : item.Photo ? [`https://ci.encar.com/carpicture${item.Photo}001.jpg`] : [];

  return {
    source: 'encar',
    source_id: String(item.Id),
    // Марка/модель переводятся с корейского на латиницу/русский (см. koreanDict.js),
    // оригинал остаётся в raw ниже.
    brand: translateBrand(item.Manufacturer),
    model: translateModel(item.Manufacturer, item.Model),
    trim: translateWords(item.Badge ?? item.BadgeDetail ?? null),
    year: parseInt(String(item.FormYear ?? item.Year).slice(0, 4), 10),
    mileage_km: item.Mileage ?? null,
    fuel_type: translateFuelType(item.FuelType ?? null),
    transmission: item.Transmission ?? null,
    engine_volume: item.Displacement ? Number(item.Displacement) / 1000 : null,
    power_hp: null, // Encar не всегда отдаёт л.с. в списке - подтягивается со страницы объявления при необходимости
    color: item.Color ?? null,
    price_origin: Number(item.Price) * 10000, // Encar отдаёт цену в "10,000 KRW" (만원)
    currency: 'KRW',
    photos,
    url: `https://www.encar.com/dc/dc_cardetailview.do?carid=${item.Id}`,
    raw: item,
  };
}

/**
 * Постранично тянет весь актуальный каталог: продолжает, пока не будет
 * пройден total (Count из первого ответа Encar) или пока страница не
 * вернётся пустой. Искусственного лимита страниц больше нет - объём
 * определяется реальным размером каталога на Encar.
 *
 * Каталог Encar - 200k+ объявлений, а на каждое ещё уходит отдельный
 * detail-запрос за полной галереей фото - полный проход занимает часы.
 * Чтобы sync.js не держал всё это в памяти и не терял прогресс при падении
 * посреди прохода, `onPage(items)` вызывается сразу после каждой страницы -
 * вызывающий код (см. syncEncar в sync.js) пишет их в БД немедленно, а не
 * ждёт полного накопления `all`.
 */
export async function fetchAllEncar({ limit = 20, brand, onPage, maxItems } = {}) {
  const all = [];
  let total = null;
  for (let page = 0; ; page++) {
    const { items, total: pageTotal } = await fetchEncarPage({ page, limit, brand });
    if (page === 0) {
      total = pageTotal;
      console.log(`[encar] всего объявлений по фильтру: ${total ?? 'неизвестно (нет Count в ответе)'}`);
    }
    if (items.length === 0) break;
    if (onPage) await onPage(items);
    all.push(...items);
    if (maxItems != null && all.length >= maxItems) break;
    if (total != null && all.length >= total) break;
    await new Promise((r) => setTimeout(r, 1200)); // не долбить API слишком часто
  }
  return all;
}
