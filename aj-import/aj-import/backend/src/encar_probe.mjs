// Разовый диагностический скрипт: смотрим сырую структуру ответа Encar
// (list API + detail API) на нескольких реальных объявлениях, чтобы понять,
// есть ли явный признак типа фото (экстерьер/интерьер/...). Результат
// использован при написании сортировки фото в parsers/encar.js
// (fetchEncarPhotos / normalizeEncarItem). Не часть прод-кода, не вызывается
// из sync.js - оставлен как воспроизводимая проверка.
//
// Запуск: node src/encar_probe.mjs (из backend/, чтобы резолвился node_modules)
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
  sr: '|ModifiedDate|0|5',
};

try {
  const { data } = await client().get(BASE, { params });
  const results = data?.SearchResults ?? [];
  console.log('=== LIST API: count of results ===', results.length, 'Count field:', data?.Count);
  for (const item of results.slice(0, 5)) {
    console.log('\n\n========== LIST ITEM RAW (id=' + item.Id + ') ==========');
    console.log(JSON.stringify(item, null, 2));
  }

  if (results[0]) {
    const id = results[0].Id;
    console.log('\n\n========== DETAIL API for id=' + id + ' ==========');
    try {
      const { data: detail } = await client().get(`${DETAIL_BASE}/${id}`);
      console.log(JSON.stringify(detail, null, 2));
    } catch (e) {
      console.log('DETAIL request failed:', e.message, e.response?.status, e.response?.data);
    }
  }
} catch (e) {
  console.log('LIST request failed:', e.message, e.response?.status);
  console.log(e.response?.data);
}
