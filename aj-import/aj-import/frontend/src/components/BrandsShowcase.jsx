import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchBrandsShowcase } from '../api.js';

function BrandCard({ brand, photo }) {
  const [broken, setBroken] = useState(false);
  const showPhoto = photo && !broken;

  return (
    <Link to={`/catalog?brand=${encodeURIComponent(brand)}`} className="brand-card">
      {showPhoto ? (
        <img src={photo} alt={brand} loading="lazy" onError={() => setBroken(true)} />
      ) : (
        <div className="brand-card-placeholder"><span>AJ</span></div>
      )}
      <div className="brand-card-overlay" />
      <span className="brand-card-label">{brand}</span>
    </Link>
  );
}

export default function BrandsShowcase() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrandsShowcase()
      .then(setBrands)
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && brands.length === 0) return null;

  return (
    <section className="section brands-showcase">
      <div className="section-inner">
        <div className="section-head">
          <h2>Найдите свою марку</h2>
        </div>

        {loading ? (
          <div className="state-msg">Загружаем марки…</div>
        ) : (
          <div className="brand-grid">
            {brands.map((b) => (
              <BrandCard key={b.brand} brand={b.brand} photo={b.photo} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
