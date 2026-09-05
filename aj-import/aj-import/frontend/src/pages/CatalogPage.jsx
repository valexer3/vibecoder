import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Filters from '../components/Filters.jsx';
import CarGrid from '../components/CarGrid.jsx';
import { fetchCars } from '../api.js';
import { useCarModals } from '../CarModalsContext.jsx';

const BASE_FILTERS = {
  country: '', brand: '', model: '',
  yearFrom: '', yearTo: '', priceFrom: '', priceTo: '', mileageTo: '',
  sort: 'newest', page: 0,
};

export default function CatalogPage() {
  const [searchParams] = useSearchParams();
  const { openDetails } = useCarModals();
  const [filters, setFilters] = useState(BASE_FILTERS);
  const [cars, setCars] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Синхронизация с ?brand= из URL - и при первом заходе, и при переходе
  // с другой ссылкой бренда, пока страница уже открыта.
  useEffect(() => {
    const urlBrand = searchParams.get('brand') ?? '';
    setFilters((f) => (f.brand === urlBrand ? f : { ...f, brand: urlBrand, page: 0 }));
  }, [searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCars(filters);
      setCars(data.items);
      setTotal(data.total);
    } catch {
      setError('Каталог временно недоступен — идёт синхронизация с источниками, зайдите чуть позже.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const pages = Math.max(1, Math.ceil(total / 24));

  return (
    <section id="catalog" className="catalog">
      <Filters value={filters} onChange={setFilters} />
      <div className="catalog-main">
        <div className="catalog-meta">
          <span>{total} автомобилей найдено</span>
        </div>
        <CarGrid cars={cars} loading={loading} error={error} onSelect={openDetails} />

        {!loading && pages > 1 && (
          <div className="pagination">
            <button
              disabled={filters.page === 0}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            >← Назад</button>
            <span>Страница {filters.page + 1} из {pages}</span>
            <button
              disabled={filters.page + 1 >= pages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            >Вперёд →</button>
          </div>
        )}
      </div>
    </section>
  );
}
