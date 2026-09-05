import { useState } from 'react';

const COUNTRY_LABEL = { encar: 'Корея', che168: 'Китай' };

function formatPrice(rub) {
  if (!rub) return 'Цена уточняется';
  return `${Math.round(rub).toLocaleString('ru-RU')} ₽`;
}

function daysAgoLabel(registeredAt) {
  if (!registeredAt) return null;
  const days = Math.floor((Date.now() - new Date(registeredAt).getTime()) / 86400000);
  if (!Number.isFinite(days) || days < 0) return null;
  if (days === 0) return 'Сегодня';
  if (days === 1) return 'Вчера';
  return `${days} дн. назад`;
}

export default function CarCard({ car, onSelect, compact = false, badge = null }) {
  const [photo, setPhoto] = useState(car.photos?.[0] ?? null);
  const photoCount = car.photos?.length ?? 0;
  const age = daysAgoLabel(car.registered_at);

  function open() {
    onSelect(car);
  }

  return (
    <article
      className={`car-card${compact ? ' car-card--compact' : ''}`}
      onClick={open}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
    >
      <div className="car-card-media">
        {photo ? (
          <img
            src={photo}
            alt={`${car.brand} ${car.model}`}
            loading="lazy"
            onError={() => setPhoto(null)}
          />
        ) : (
          <div className="car-card-media-placeholder">
            <span className="car-card-media-placeholder-mark">AJ</span>
            <span>Фото уточняется</span>
          </div>
        )}
        <div className="car-card-media-overlay" />
        <span className="car-card-origin">{COUNTRY_LABEL[car.source] ?? car.source}</span>
        {photoCount > 1 && <span className="car-card-photo-count">{photoCount} фото</span>}
        {age && <span className="car-card-age">{age}</span>}
        {badge && <span className="car-card-badge">{badge}</span>}
      </div>

      <div className="car-card-body">
        <h3>{car.brand} {car.model}</h3>
        {car.trim && <p className="car-card-trim">{car.trim}</p>}

        <dl className="car-card-specs">
          <div><dt>Год</dt><dd>{car.year ?? '—'}</dd></div>
          <div><dt>Пробег</dt><dd>{car.mileage_km != null ? `${car.mileage_km.toLocaleString('ru-RU')} км` : '—'}</dd></div>
          <div><dt>Топливо</dt><dd>{car.fuel_type ?? '—'}</dd></div>
          <div><dt>Кузов</dt><dd>{car.body_type ?? '—'}</dd></div>
        </dl>

        <div className="car-card-price">{formatPrice(car.price_rub)}</div>
      </div>
    </article>
  );
}
