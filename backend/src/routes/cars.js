import { Router } from 'express';
import { pool } from '../db.js';
// ВРЕМЕННО для локального визуального ревью без PostgreSQL: см. MOCK_DATA ниже
// и backend/src/mockData.js. Перед деплоем в прод — удалить этот импорт,
// использования USE_MOCK и файл mockData.js.
import { queryMockCars, getMockCarById, getMockBrands } from '../mockData.js';

const router = Router();
const USE_MOCK = process.env.MOCK_DATA === 'true';

// GET /api/cars?country=korea|china&brand=&model=&yearFrom=&yearTo=&priceFrom=&priceTo=&mileageTo=&page=&limit=
router.get('/', async (req, res, next) => {
  try {
    if (USE_MOCK) return res.json(queryMockCars(req.query));

    const {
      country, brand, model, yearFrom, yearTo,
      priceFrom, priceTo, mileageTo,
      page = 0, limit = 24, sort = 'newest',
    } = req.query;

    const where = ['is_active = true'];
    const vals = [];
    let i = 1;

    if (country === 'korea') { where.push(`source = 'encar'`); }
    if (country === 'china') { where.push(`source = 'che168'`); }
    if (brand) { where.push(`brand ILIKE $${i++}`); vals.push(brand); }
    if (model) { where.push(`model ILIKE $${i++}`); vals.push(`%${model}%`); }
    if (yearFrom) { where.push(`year >= $${i++}`); vals.push(Number(yearFrom)); }
    if (yearTo) { where.push(`year <= $${i++}`); vals.push(Number(yearTo)); }
    if (priceFrom) { where.push(`price_rub >= $${i++}`); vals.push(Number(priceFrom)); }
    if (priceTo) { where.push(`price_rub <= $${i++}`); vals.push(Number(priceTo)); }
    if (mileageTo) { where.push(`mileage_km <= $${i++}`); vals.push(Number(mileageTo)); }

    const orderBy = sort === 'price_asc' ? 'price_rub ASC NULLS LAST'
      : sort === 'price_desc' ? 'price_rub DESC NULLS LAST'
      : sort === 'year_desc' ? 'year DESC'
      : 'last_seen_at DESC';

    const lim = Math.min(Number(limit) || 24, 60);
    const pageNum = Math.max(0, Math.trunc(Number(page)) || 0);
    const off = pageNum * lim;

    const sql = `
      SELECT id, source, brand, model, trim, year, mileage_km, fuel_type,
             transmission, engine_volume, price_origin, currency, price_rub,
             photos, url
      FROM cars
      WHERE ${where.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT ${lim} OFFSET ${off}
    `;
    const { rows } = await pool.query(sql, vals);

    const countSql = `SELECT COUNT(*)::int AS total FROM cars WHERE ${where.join(' AND ')}`;
    const { rows: countRows } = await pool.query(countSql, vals);

    res.json({ items: rows, total: countRows[0].total, page: pageNum, limit: lim });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (USE_MOCK) {
      const car = getMockCarById(req.params.id);
      return car ? res.json(car) : res.status(404).json({ error: 'not_found' });
    }

    if (!/^\d+$/.test(req.params.id)) return res.status(404).json({ error: 'not_found' });
    const { rows } = await pool.query('SELECT * FROM cars WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Список доступных брендов (для фильтра) с учётом текущей страны
router.get('/meta/brands', async (req, res, next) => {
  try {
    if (USE_MOCK) return res.json(getMockBrands(req.query.country));

    const { country } = req.query;
    const where = ["is_active = true"];
    if (country === 'korea') where.push(`source = 'encar'`);
    if (country === 'china') where.push(`source = 'che168'`);
    const { rows } = await pool.query(
      `SELECT DISTINCT brand FROM cars WHERE ${where.join(' AND ')} AND brand IS NOT NULL ORDER BY brand`
    );
    res.json(rows.map((r) => r.brand));
  } catch (err) {
    next(err);
  }
});

export default router;
