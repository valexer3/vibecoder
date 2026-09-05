import { useEffect, useState } from 'react';
import { fetchBrands } from '../api.js';

const COUNTRIES = [
  { value: '', label: 'Все страны' },
  { value: 'korea', label: 'Корея' },
  { value: 'china', label: 'Китай' },
];

const SORTS = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'price_asc', label: 'Цена: по возрастанию' },
  { value: 'price_desc', label: 'Цена: по убыванию' },
  { value: 'year_desc', label: 'Год: сначала новее' },
];

export default function Filters({ value, onChange }) {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetchBrands(value.country).then(setBrands);
  }, [value.country]);

  function set(key, v) {
    onChange({ ...value, [key]: v, page: 0 });
  }

  return (
    <aside className="filters">
      <div className="filters-head">
        <span className="filters-eyebrow">Найти автомобиль</span>
      </div>

      <label className="field">
        <span>Страна</span>
        <select value={value.country} onChange={(e) => set('country', e.target.value)}>
          {COUNTRIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Марка</span>
        <select value={value.brand} onChange={(e) => set('brand', e.target.value)}>
          <option value="">Любая</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Модель</span>
        <input
          type="text"
          placeholder="Например, Sonata"
          value={value.model}
          onChange={(e) => set('model', e.target.value)}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Год от</span>
          <input type="number" placeholder="2015" value={value.yearFrom}
            onChange={(e) => set('yearFrom', e.target.value)} />
        </label>
        <label className="field">
          <span>Год до</span>
          <input type="number" placeholder="2026" value={value.yearTo}
            onChange={(e) => set('yearTo', e.target.value)} />
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>Цена от, ₽</span>
          <input type="number" placeholder="1 000 000" value={value.priceFrom}
            onChange={(e) => set('priceFrom', e.target.value)} />
        </label>
        <label className="field">
          <span>Цена до, ₽</span>
          <input type="number" placeholder="5 000 000" value={value.priceTo}
            onChange={(e) => set('priceTo', e.target.value)} />
        </label>
      </div>

      <label className="field">
        <span>Пробег до, км</span>
        <input type="number" placeholder="100000" value={value.mileageTo}
          onChange={(e) => set('mileageTo', e.target.value)} />
      </label>

      <label className="field">
        <span>Сортировка</span>
        <select value={value.sort} onChange={(e) => set('sort', e.target.value)}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </label>
    </aside>
  );
}
