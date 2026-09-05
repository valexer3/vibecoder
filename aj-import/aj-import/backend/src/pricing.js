const DELIVERY_FEE_RUB = 50000;

// price_rub = round_to_thousand(price_origin * fxRate + 50 000 ₽)
export function calculatePriceRub(priceOrigin, fxRate) {
  if (priceOrigin == null || fxRate == null) return null;
  const raw = Number(priceOrigin) * Number(fxRate) + DELIVERY_FEE_RUB;
  if (!Number.isFinite(raw)) return null;
  return Math.round(raw / 1000) * 1000;
}
