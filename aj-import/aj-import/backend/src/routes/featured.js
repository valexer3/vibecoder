import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET /api/cars/featured?limit=8-12
// Сначала вручную закреплённые (is_featured = true), затем остальные места
// добираются алгоритмически: чем дешевле цена относительно среднего по
// своей группе (марка+модель+год) и чем меньше пробег относительно средней
// по группе - тем выше в списке.
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Math.trunc(Number(req.query.limit)) || 12, 8), 12);

    const sql = `
      SELECT id, source, brand, model, trim, year, mileage_km, fuel_type,
             transmission, engine_volume, price_origin, currency, price_rub,
             photos, url, is_featured,
             (price_ratio IS NOT NULL AND price_ratio <= 0.9) AS is_top_price
      FROM (
        SELECT c.*,
          c.price_rub::numeric / NULLIF(AVG(c.price_rub) OVER (PARTITION BY c.brand, c.model, c.year), 0) AS price_ratio,
          c.mileage_km::numeric / NULLIF(AVG(c.mileage_km) OVER (PARTITION BY c.brand, c.model, c.year), 0) AS mileage_ratio
        FROM cars c
        WHERE c.is_active = true
      ) t
      ORDER BY
        is_featured DESC,
        COALESCE(price_ratio, 1) ASC,
        COALESCE(mileage_ratio, 1) ASC
      LIMIT $1
    `;
    const { rows } = await pool.query(sql, [limit]);
    res.json({ items: rows });
  } catch (err) {
    next(err);
  }
});

export default router;
