import { Router } from 'express';
import pool from '../db/pool.js';
import { normalizeBannerRow } from '../utils/mediaUrls.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, subtitle, cta_text, cta_link, image_url, badge_text, sort_order, is_active
       FROM banners WHERE is_active = TRUE ORDER BY sort_order ASC, id ASC`
    );
    res.json({ data: rows.map(normalizeBannerRow) });
  } catch (err) {
    next(err);
  }
});

export default router;
