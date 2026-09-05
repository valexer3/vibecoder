import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CarCard from './CarCard.jsx';
import { fetchFeatured } from '../api.js';

export default function FeaturedSection({ onSelectCar }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatured()
      .then((data) => setCars(data.items ?? []))
      .catch(() => setCars([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && cars.length === 0) return null;

  return (
    <section className="section featured">
      <div className="section-inner">
        <div className="section-head">
          <h2>Лучшие предложения</h2>
          <Link to="/catalog" className="section-link">Весь каталог →</Link>
        </div>

        {loading ? (
          <div className="state-msg">Загружаем подборку…</div>
        ) : (
          <div className="featured-grid">
            {cars.map((car) => (
              <CarCard
                key={`${car.source}-${car.id}`}
                car={car}
                onSelect={onSelectCar}
                compact
                badge={car.is_top_price ? 'Топ цена' : null}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
