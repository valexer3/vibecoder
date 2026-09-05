// ВРЕМЕННЫЙ файл для локального визуального ревью каталога без PostgreSQL.
// Используется только когда в .env стоит MOCK_DATA=true (см. routes/cars.js).
// Перед деплоем в прод: удалить этот файл и импорт/использование MOCK_DATA в routes/cars.js.

export const mockCars = [
  { id: 1, source: 'encar', brand: 'Hyundai', model: 'Sonata', trim: '2.0 Smart', year: 2022, mileage_km: 34000, fuel_type: 'Бензин', transmission: 'Автомат', engine_volume: 2.0, price_origin: 24500000, currency: 'KRW', price_rub: 1650000, photos: ['https://picsum.photos/seed/1/400/300'], url: 'https://encar.com/1' },
  { id: 2, source: 'encar', brand: 'Kia', model: 'K5', trim: '1.6T GT-Line', year: 2023, mileage_km: 12000, fuel_type: 'Бензин', transmission: 'Автомат', engine_volume: 1.6, price_origin: 27800000, currency: 'KRW', price_rub: 1890000, photos: ['https://picsum.photos/seed/2/400/300'], url: 'https://encar.com/2' },
  { id: 3, source: 'encar', brand: 'Genesis', model: 'G80', trim: '3.5T AWD', year: 2021, mileage_km: 58000, fuel_type: 'Бензин', transmission: 'Автомат', engine_volume: 3.5, price_origin: 46000000, currency: 'KRW', price_rub: 3120000, photos: ['https://picsum.photos/seed/3/400/300'], url: 'https://encar.com/3' },
  { id: 4, source: 'encar', brand: 'Hyundai', model: 'Tucson', trim: '2.0 Prime', year: 2020, mileage_km: 71000, fuel_type: 'Дизель', transmission: 'Автомат', engine_volume: 2.0, price_origin: 21000000, currency: 'KRW', price_rub: 1420000, photos: [], url: 'https://encar.com/4' },
  { id: 5, source: 'encar', brand: 'Kia', model: 'Sportage', trim: '1.6T Nu', year: 2024, mileage_km: 5000, fuel_type: 'Бензин', transmission: 'Автомат', engine_volume: 1.6, price_origin: 31500000, currency: 'KRW', price_rub: 2140000, photos: ['https://picsum.photos/seed/5/400/300'], url: 'https://encar.com/5' },
  { id: 6, source: 'encar', brand: 'SsangYong', model: 'Torres', trim: 'Adventure', year: 2023, mileage_km: 21000, fuel_type: 'Бензин', transmission: 'Автомат', engine_volume: 1.5, price_origin: 26400000, currency: 'KRW', price_rub: 1790000, photos: ['https://picsum.photos/seed/6/400/300'], url: 'https://encar.com/6' },
  { id: 7, source: 'encar', brand: 'Genesis', model: 'GV70', trim: '2.5T AWD', year: 2022, mileage_km: 39000, fuel_type: 'Бензин', transmission: 'Автомат', engine_volume: 2.5, price_origin: 49500000, currency: 'KRW', price_rub: 3350000, photos: ['https://picsum.photos/seed/7/400/300'], url: 'https://encar.com/7' },
  { id: 8, source: 'encar', brand: 'Hyundai', model: 'Avante', trim: '1.6 Modern', year: 2021, mileage_km: 46000, fuel_type: 'Бензин', transmission: 'Механика', engine_volume: 1.6, price_origin: 16800000, currency: 'KRW', price_rub: 1140000, photos: [], url: 'https://encar.com/8' },
  { id: 9, source: 'encar', brand: 'Kia', model: 'EV6', trim: 'Long Range', year: 2023, mileage_km: 18000, fuel_type: 'Электро', transmission: 'Автомат', engine_volume: null, price_origin: 52000000, currency: 'KRW', price_rub: 3520000, photos: ['https://picsum.photos/seed/9/400/300'], url: 'https://encar.com/9' },
  { id: 10, source: 'che168', brand: 'BYD', model: 'Han', trim: 'EV Champion', year: 2023, mileage_km: 15000, fuel_type: 'Электро', transmission: 'Автомат', engine_volume: null, price_origin: 219800, currency: 'CNY', price_rub: 2980000, photos: ['https://picsum.photos/seed/10/400/300'], url: 'https://che168.com/10' },
  { id: 11, source: 'che168', brand: 'Geely', model: 'Monjaro', trim: 'Flagship AWD', year: 2022, mileage_km: 32000, fuel_type: 'Бензин', transmission: 'Автомат', engine_volume: 2.0, price_origin: 189000, currency: 'CNY', price_rub: 2560000, photos: ['https://picsum.photos/seed/11/400/300'], url: 'https://che168.com/11' },
  { id: 12, source: 'che168', brand: 'Chery', model: 'Tiggo 8 Pro', trim: 'Max', year: 2023, mileage_km: 9000, fuel_type: 'Бензин', transmission: 'Робот', engine_volume: 1.6, price_origin: 148000, currency: 'CNY', price_rub: 2010000, photos: [], url: 'https://che168.com/12' },
  { id: 13, source: 'che168', brand: 'Haval', model: 'F7', trim: 'Coupe 2.0T', year: 2021, mileage_km: 54000, fuel_type: 'Бензин', transmission: 'Робот', engine_volume: 2.0, price_origin: 112000, currency: 'CNY', price_rub: 1520000, photos: ['https://picsum.photos/seed/13/400/300'], url: 'https://che168.com/13' },
  { id: 14, source: 'che168', brand: 'Changan', model: 'CS75 Plus', trim: 'Elite', year: 2022, mileage_km: 27000, fuel_type: 'Бензин', transmission: 'Автомат', engine_volume: 1.5, price_origin: 129000, currency: 'CNY', price_rub: 1750000, photos: ['https://picsum.photos/seed/14/400/300'], url: 'https://che168.com/14' },
  { id: 15, source: 'che168', brand: 'Exeed', model: 'TXL', trim: 'Elite AWD', year: 2023, mileage_km: 13000, fuel_type: 'Бензин', transmission: 'Робот', engine_volume: 2.0, price_origin: 172000, currency: 'CNY', price_rub: 2330000, photos: ['https://picsum.photos/seed/15/400/300'], url: 'https://che168.com/15' },
  { id: 16, source: 'che168', brand: 'BYD', model: 'Song Plus', trim: 'DM-i', year: 2024, mileage_km: 2000, fuel_type: 'Гибрид', transmission: 'Автомат', engine_volume: 1.5, price_origin: 158000, currency: 'CNY', price_rub: 2140000, photos: [], url: 'https://che168.com/16' },
  { id: 17, source: 'che168', brand: 'Zeekr', model: '001', trim: 'WE Long Range', year: 2023, mileage_km: 24000, fuel_type: 'Электро', transmission: 'Автомат', engine_volume: null, price_origin: 268000, currency: 'CNY', price_rub: 3630000, photos: ['https://picsum.photos/seed/17/400/300'], url: 'https://che168.com/17' },
  { id: 18, source: 'encar', brand: 'Hyundai', model: 'Palisade', trim: '3.8 Prestige', year: 2020, mileage_km: 88000, fuel_type: 'Бензин', transmission: 'Автомат', engine_volume: 3.8, price_origin: 34000000, currency: 'KRW', price_rub: 2290000, photos: ['https://picsum.photos/seed/18/400/300'], url: 'https://encar.com/18' },
].map((c) => ({ ...c, is_active: true, last_seen_at: new Date().toISOString() }));

function matchesFilters(car, { country, brand, model, yearFrom, yearTo, priceFrom, priceTo, mileageTo }) {
  if (country === 'korea' && car.source !== 'encar') return false;
  if (country === 'china' && car.source !== 'che168') return false;
  if (brand && car.brand.toLowerCase() !== String(brand).toLowerCase()) return false;
  if (model && !car.model.toLowerCase().includes(String(model).toLowerCase())) return false;
  if (yearFrom && car.year < Number(yearFrom)) return false;
  if (yearTo && car.year > Number(yearTo)) return false;
  if (priceFrom && car.price_rub < Number(priceFrom)) return false;
  if (priceTo && car.price_rub > Number(priceTo)) return false;
  if (mileageTo && car.mileage_km > Number(mileageTo)) return false;
  return true;
}

function sortCars(cars, sort) {
  const arr = [...cars];
  if (sort === 'price_asc') arr.sort((a, b) => (a.price_rub ?? Infinity) - (b.price_rub ?? Infinity));
  else if (sort === 'price_desc') arr.sort((a, b) => (b.price_rub ?? -Infinity) - (a.price_rub ?? -Infinity));
  else if (sort === 'year_desc') arr.sort((a, b) => b.year - a.year);
  else arr.sort((a, b) => b.id - a.id); // newest
  return arr;
}

export function queryMockCars(query) {
  const { page = 0, limit = 24, sort = 'newest' } = query;
  const filtered = sortCars(mockCars.filter((c) => matchesFilters(c, query)), sort);

  const lim = Math.min(Number(limit) || 24, 60);
  const pageNum = Math.max(0, Math.trunc(Number(page)) || 0);
  const off = pageNum * lim;

  const items = filtered.slice(off, off + lim).map(({ is_active, last_seen_at, ...rest }) => rest);
  return { items, total: filtered.length, page: pageNum, limit: lim };
}

export function getMockCarById(id) {
  return mockCars.find((c) => String(c.id) === String(id)) ?? null;
}

export function getMockBrands(country) {
  const brands = mockCars
    .filter((c) => (country === 'korea' ? c.source === 'encar' : country === 'china' ? c.source === 'che168' : true))
    .map((c) => c.brand);
  return [...new Set(brands)].sort();
}
