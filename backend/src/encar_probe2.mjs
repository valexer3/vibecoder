// Продолжение проверки из encar_probe.mjs: смотрим distinct-значения поля
// detail.photos[].type на нескольких других объявлениях, чтобы убедиться,
// что схема (OUTER/INNER/OPTION/DIAG2/THUMBNAIL) стабильна, а не случайность
// одного объявления. Не часть прод-кода.
//
// Запуск: node src/encar_probe2.mjs (из backend/)
import axios from 'axios';

const BASE = 'https://api.encar.com/search/car/list/general';
const DETAIL_BASE = 'https://api.encar.com/v1/readside/vehicle';

function client() {
  return axios.create({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      Referer: 'https://www.encar.com/',
      Origin: 'https://www.encar.com',
    },
    timeout: 15000,
  });
}

const params = {
  count: true,
  q: '(And.Hidden.N._.CarType.A.)',
  sr: '|ModifiedDate|10|4',
};

const { data } = await client().get(BASE, { params });
const results = data?.SearchResults ?? [];

for (const item of results) {
  const id = item.Id;
  try {
    const { data: detail } = await client().get(`${DETAIL_BASE}/${id}`);
    const photos = detail?.photos ?? [];
    const types = [...new Set(photos.map((p) => p.type))];
    console.log(`\nid=${id} dummy=${detail?.manage?.dummy} photoCount=${photos.length} distinctTypes=${JSON.stringify(types)}`);
    console.log('first 6 in raw API order:', photos.slice(0, 6).map((p) => `${p.code}:${p.type}`).join(', '));
    const outerSorted = photos.filter(p => p.type === 'OUTER').sort((a,b)=>Number(a.code)-Number(b.code));
    console.log('OUTER sorted by code (first 3):', outerSorted.slice(0,3).map(p=>`${p.code}:${p.path}`).join(', '));
  } catch (e) {
    console.log(`id=${id} DETAIL failed:`, e.message);
  }
  await new Promise((r) => setTimeout(r, 400));
}
