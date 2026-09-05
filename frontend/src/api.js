const BASE = import.meta.env.VITE_API_URL || '/api';

export async function fetchCars(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  ).toString();
  const res = await fetch(`${BASE}/cars?${qs}`);
  if (!res.ok) throw new Error('Не удалось загрузить каталог');
  return res.json();
}

export async function fetchBrands(country) {
  const qs = country ? `?country=${country}` : '';
  const res = await fetch(`${BASE}/cars/meta/brands${qs}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchFeatured(limit) {
  const qs = limit ? `?limit=${limit}` : '';
  const res = await fetch(`${BASE}/cars/featured${qs}`);
  if (!res.ok) throw new Error('Не удалось загрузить подборку');
  return res.json();
}

export async function fetchBrandsShowcase() {
  const res = await fetch(`${BASE}/cars/brands-showcase`);
  if (!res.ok) throw new Error('Не удалось загрузить бренды');
  return res.json();
}

export async function submitLead(payload) {
  const res = await fetch(`${BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Не удалось отправить заявку');
  return res.json();
}
