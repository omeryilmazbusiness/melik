import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, title, subtitle, image_url, link FROM promo_tiles ORDER BY sort_order ASC'
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

export default router;
