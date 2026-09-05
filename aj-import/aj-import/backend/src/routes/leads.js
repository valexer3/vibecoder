import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// POST /api/leads  { car_id?, name, phone, message? }
router.post('/', async (req, res, next) => {
  try {
    const { car_id, name, phone, message } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone_required' });

    const { rows } = await pool.query(
      `INSERT INTO leads (car_id, name, phone, message) VALUES ($1,$2,$3,$4) RETURNING id`,
      [car_id ?? null, name ?? null, phone, message ?? null]
    );

    // TODO: сюда же отправка уведомления в Telegram-бот AJ Import,
    // по аналогии с остальными твоими ботами (agent-team / octopus-vpn),
    // просто POST на bot API с текстом заявки.

    res.json({ ok: true, id: rows[0].id });
  } catch (err) {
    next(err);
  }
});

export default router;
