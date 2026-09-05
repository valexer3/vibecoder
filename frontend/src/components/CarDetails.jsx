import { useState } from 'react';
import { OPTION_MAP, OPTION_GROUPS } from '../optionCodes.js';

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

const ENCAR_VERIFIED_LABELS = {
  encarCheck: 'Encar Check',
  diagnosisCar: 'Диагностика Encar',
  directInspected: 'Осмотрено лично',
  preVerified: 'Предпроверено',
};

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
    ['Кузов', car.body_type ?? '—'],
    ['Объём двигателя', car.engine_volume ? `${car.engine_volume} л` : '—'],
    ['Цвет', car.color ?? '—'],
    ...(car.vin ? [['VIN', car.vin]] : []),
  ];

  const verifiedBadges = Object.entries(ENCAR_VERIFIED_LABELS)
    .filter(([key]) => car.encar_verified?.[key])
    .map(([, label]) => label);

  const accidentReportAvailable = car.accident_info?.recordView || car.accident_info?.resumeView;
  const seizingCount = car.seizing_info?.seizingCount ?? 0;
  const pledgeCount = car.seizing_info?.pledgeCount ?? 0;
  const hasSeizingInfo = car.seizing_info != null;

  const warranty = car.warranty_info;
  const hasWarranty = warranty && (warranty.bodyMonth || warranty.transmissionMonth);

  // Показываем "цену нового" только как ориентир выгоды, и только если она
  // заметно выше текущей цены объявления - сравниваем в одной валюте
  // (origin_price и price_origin оба в валюте площадки-источника, KRW/CNY;
  // price_rub - это уже пересчитанная в рубли цена ОБЪЯВЛЕНИЯ, сравнивать
  // с ней origin_price напрямую нельзя - разные валюты дадут бессмысленное
  // число). Порог 15% - чтобы не показывать блок на машинах, купленных
  // почти по цене новой (выгода в пределах естественного разброса).
  const showOriginPrice = car.origin_price != null && car.price_origin != null
    && car.origin_price > car.price_origin * 1.15;

  const optionCodes = car.options ?? [];
  const knownOptions = optionCodes.map((code) => OPTION_MAP[code]).filter(Boolean);
  const unknownOptionsCount = optionCodes.length - knownOptions.length;
  const optionsByGroup = Object.keys(OPTION_GROUPS)
    .map((group) => ({ group, label: OPTION_GROUPS[group], items: knownOptions.filter((o) => o.group === group) }))
    .filter((g) => g.items.length > 0);

  const report = car.inspection_report;
  const damagedPanels = (report?.damagedPanels ?? []).filter((p) => p.panel);

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

          {verifiedBadges.length > 0 && (
            <div className="details-verified-badges">
              {verifiedBadges.map((label) => (
                <span key={label} className="details-verified-badge">✓ {label}</span>
              ))}
            </div>
          )}

          <dl className="details-specs">
            {specs.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>

          {(car.accident_info != null || hasSeizingInfo) && (
            <div className="details-trust-block">
              <h4>История и юридическая чистота</h4>
              {car.accident_info != null && (
                <p className={accidentReportAvailable ? 'is-ok' : 'is-warn'}>
                  {accidentReportAvailable ? '✓' : '⚠'} {accidentReportAvailable
                    ? 'Отчёт по истории доступен на Encar'
                    : 'Отчёт по истории недоступен'}
                </p>
              )}
              {hasSeizingInfo && (
                <p className={seizingCount === 0 && pledgeCount === 0 ? 'is-ok' : 'is-warn'}>
                  {seizingCount === 0 && pledgeCount === 0
                    ? '✓ Обременений и залогов нет'
                    : `⚠ Обременения: ${seizingCount}, залоги: ${pledgeCount}`}
                </p>
              )}
            </div>
          )}

          {report && (
            <div className="details-trust-block">
              <h4>Официальный отчёт техосмотра</h4>
              <p className={report.accident ? 'is-warn' : 'is-ok'}>
                {report.accident ? '⚠ ДТП зафиксировано' : '✓ ДТП не зафиксировано'}
              </p>
              <p className={report.simpleRepair ? 'is-warn' : 'is-ok'}>
                {report.simpleRepair ? '⚠ Простой ремонт был' : '✓ Простого ремонта не было'}
              </p>
              <p className={report.waterlog ? 'is-warn' : 'is-ok'}>
                {report.waterlog ? '⚠ Признаки затопления' : '✓ Признаков затопления нет'}
              </p>
              {report.mileage != null && (
                <p>Пробег по одометру: {report.mileage.toLocaleString('ru-RU')} км
                  {report.mileageStateType ? ` (${report.mileageStateType})` : ''}
                </p>
              )}
              {report.boardStateType && <p>Состояние VIN-таблички: {report.boardStateType}</p>}
              {(report.coout || report.hcout) && (
                <p>Выбросы: {report.coout ? `CO ${report.coout}%` : ''}{report.coout && report.hcout ? ', ' : ''}{report.hcout ? `HC ${report.hcout}ppm` : ''}</p>
              )}
              <p className={report.tuning ? 'is-warn' : 'is-ok'}>{report.tuning ? '⚠ Есть тюнинг' : '✓ Тюнинга нет'}</p>
              <p className={report.recall ? 'is-warn' : 'is-ok'}>{report.recall ? '⚠ Есть открытый отзыв производителя' : '✓ Отзывов нет'}</p>
              {damagedPanels.length > 0 && (
                <p className="is-warn">⚠ Заменены/повреждены: {damagedPanels.map((p) => p.panel).join(', ')}</p>
              )}
              {car.inspection_report_url && (
                <a className="details-source-link" href={car.inspection_report_url} target="_blank" rel="noreferrer">
                  Посмотреть оригинал отчёта на Encar →
                </a>
              )}
            </div>
          )}

          {hasWarranty && (
            <div className="details-warranty-block">
              <h4>Гарантия</h4>
              {warranty.bodyMonth && (
                <p>Кузов: {warranty.bodyMonth} мес / {warranty.bodyMileage?.toLocaleString('ru-RU')} км</p>
              )}
              {warranty.transmissionMonth && (
                <p>Трансмиссия: {warranty.transmissionMonth} мес / {warranty.transmissionMileage?.toLocaleString('ru-RU')} км</p>
              )}
            </div>
          )}

          <div className="details-price-block">
            <div className="details-price">{formatPrice(car.price_rub)}</div>
            {formatOrigin(car.price_origin, car.currency) && (
              <div className="details-price-origin">
                {formatOrigin(car.price_origin, car.currency)} на площадке-источнике
              </div>
            )}
            {showOriginPrice && (
              <div className="details-price-new">
                Цена нового: {formatOrigin(car.origin_price, car.currency)}
              </div>
            )}
          </div>

          {optionCodes.length > 0 && (
            <details className="details-options">
              <summary>Комплектация ({optionCodes.length})</summary>
              {optionsByGroup.map(({ group, label, items }) => (
                <div key={group} className="details-options-group">
                  <h5>{label}</h5>
                  <ul className="details-options-list">
                    {items.map((opt) => (
                      <li key={opt.name}><span aria-hidden="true">{opt.icon}</span> {opt.name}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {unknownOptionsCount > 0 && (
                <p className="details-options-more">+{unknownOptionsCount} ещё</p>
              )}
            </details>
          )}

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
