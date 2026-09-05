import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET /api/cars/brands-showcase
// Список уникальных активных брендов с одним "лучшим" фото каждого -
// берётся с самого нового (по last_seen_at) активного объявления этого
// бренда, у которого вообще есть фото. Если ни у одного объявления бренда
// нет фото - photo: null (фронт покажет заглушку).
router.get('/', async (req, res, next) => {
  try {
    const sql = `
      WITH brands AS (
        SELECT DISTINCT brand FROM cars WHERE is_active = true AND brand IS NOT NULL
      ),
      best_photo AS (
        SELECT DISTINCT ON (brand) brand, photos->>0 AS photo
        FROM cars
        WHERE is_active = true AND jsonb_array_length(photos) > 0
        ORDER BY brand, last_seen_at DESC
      )
      SELECT b.brand, bp.photo
      FROM brands b
      LEFT JOIN best_photo bp ON bp.brand = b.brand
      ORDER BY b.brand
    `;
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
