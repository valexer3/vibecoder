import { useState } from 'react';

const COUNTRY_LABEL = { encar: 'Корея', che168: 'Китай' };
const CURRENCY_LABEL = { KRW: '₩', CNY: '¥' };

function formatPrice(rub) {
  if (!rub) return 'Цена уточняется';
  return `${Math.round(rub).toLocaleString('ru-RU')} ₽`;
}

function formatOrigin(price, currency) {
  if (price == null) return null;
  const symbol = CURRENCY_LABEL[currency] ?? currency ?? '';
  return `${Math.round(price).toLocaleString('ru-RU')} ${symbol}`;
}

export default function CarDetails({ car, onClose, onRequestLead }) {
  const photos = car.photos?.length ? car.photos : [];
  const [active, setActive] = useState(0);
  const [broken, setBroken] = useState({});

  const activePhoto = !broken[active] ? photos[active] : null;

  function next() {
    setActive((i) => (i + 1) % photos.length);
  }
  function prev() {
    setActive((i) => (i - 1 + photos.length) % photos.length);
  }

  const specs = [
    ['Год', car.year ?? '—'],
    ['Пробег', car.mileage_km != null ? `${car.mileage_km.toLocaleString('ru-RU')} км` : '—'],
    ['Топливо', car.fuel_type ?? '—'],
    ['Коробка', car.transmission ?? '—'],
    ['Объём двигателя', car.engine_volume ? `${car.engine_volume} л` : '—'],
    ['Цвет', car.color ?? '—'],
  ];

  return (
    <div className="details-overlay" onClick={onClose}>
      <div className="details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="details-close" onClick={onClose} aria-label="Закрыть">×</button>

        <div className="details-gallery">
          <div className="details-gallery-main">
            {activePhoto ? (
              <img
                src={activePhoto}
                alt={`${car.brand} ${car.model}`}
                onError={() => setBroken((b) => ({ ...b, [active]: true }))}
              />
            ) : (
              <div className="details-gallery-placeholder">
                <span className="details-gallery-placeholder-mark">AJ</span>
                <span>Фото уточняется</span>
              </div>
            )}
            <span className="details-gallery-origin">{COUNTRY_LABEL[car.source] ?? car.source}</span>
            {photos.length > 1 && (
              <>
                <button className="details-gallery-nav details-gallery-nav--prev" onClick={prev} aria-label="Предыдущее фото">‹</button>
                <button className="details-gallery-nav details-gallery-nav--next" onClick={next} aria-label="Следующее фото">›</button>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <div className="details-thumbs">
              {photos.map((p, i) => (
                <button
                  key={p + i}
                  className={`details-thumb ${i === active ? 'is-active' : ''}`}
                  onClick={() => setActive(i)}
                >
                  {!broken[i] ? <img src={p} alt="" /> : <span className="details-thumb-broken">AJ</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="details-body">
          <h2>{car.brand} {car.model}</h2>
          {car.trim && <p className="details-trim">{car.trim}</p>}

          <dl className="details-specs">
            {specs.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>

          <div className="details-price-block">
            <div className="details-price">{formatPrice(car.price_rub)}</div>
            {formatOrigin(car.price_origin, car.currency) && (
              <div className="details-price-origin">
                {formatOrigin(car.price_origin, car.currency)} на площадке-источнике
              </div>
            )}
          </div>

          <div className="details-actions">
            <button className="details-cta" onClick={() => onRequestLead(car)}>Оставить заявку</button>
            {car.url && (
              <a className="details-source-link" href={car.url} target="_blank" rel="noreferrer">
                Смотреть оригинал объявления →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
