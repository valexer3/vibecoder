// Стилизованные силуэты авто для декора hero-секции. Векторные (не фото) -
// пока нет фирменной съёмки, это даёт консистентный вид без лишних
// внешних зависимостей. Заменить на реальные рендеры/фото можно будет
// просто подставив <img> вместо этого компонента.
const SHAPES = {
  sedan: (
    <>
      <rect x="10" y="34" width="92" height="24" rx="10" />
      <rect x="10" y="50" width="180" height="26" rx="13" />
      <circle cx="45" cy="76" r="13" />
      <circle cx="155" cy="76" r="13" />
    </>
  ),
  crossover: (
    <>
      <rect x="18" y="18" width="140" height="34" rx="12" />
      <rect x="6" y="44" width="172" height="30" rx="14" />
      <circle cx="42" cy="76" r="14" />
      <circle cx="150" cy="76" r="14" />
    </>
  ),
  ev: (
    <>
      <rect x="8" y="28" width="168" height="40" rx="20" />
      <rect x="30" y="16" width="110" height="24" rx="12" />
      <circle cx="42" cy="70" r="13" />
      <circle cx="150" cy="70" r="13" />
    </>
  ),
  coupe: (
    <>
      <rect x="16" y="38" width="60" height="20" rx="9" />
      <rect x="10" y="52" width="158" height="24" rx="12" />
      <circle cx="42" cy="78" r="12" />
      <circle cx="142" cy="78" r="12" />
    </>
  ),
};

export default function CarSilhouette({ type = 'sedan', className }) {
  return (
    <svg viewBox="0 0 200 96" className={className} aria-hidden="true" fill="currentColor">
      {SHAPES[type] ?? SHAPES.sedan}
    </svg>
  );
}
