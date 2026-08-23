import { Router } from 'express';
import pool from '../../db/pool.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM banners ORDER BY sort_order ASC, id ASC'
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM banners WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Banner bulunamadı' });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, subtitle, cta_text, cta_link, image_url, badge_text, sort_order, is_active } = req.body;

    if (!title?.trim()) return res.status(400).json({ error: 'Başlık gerekli' });
    if (!image_url?.trim()) return res.status(400).json({ error: 'Banner görseli gerekli' });

    const { rows } = await pool.query(
      `INSERT INTO banners (title, subtitle, cta_text, cta_link, image_url, badge_text, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        title.trim(),
        subtitle || null,
        cta_text || 'ALIŞVERİŞE BAŞLA',
        cta_link || '/',
        image_url.trim(),
        badge_text || null,
        sort_order ?? 0,
        is_active !== false,
      ]
    );

    res.status(201).json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { title, subtitle, cta_text, cta_link, image_url, badge_text, sort_order, is_active } = req.body;

    const { rows: existing } = await pool.query('SELECT * FROM banners WHERE id = $1', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Banner bulunamadı' });

    const current = existing[0];
    const { rows } = await pool.query(
      `UPDATE banners SET
        title = $1,
        subtitle = $2,
        cta_text = $3,
        cta_link = $4,
        image_url = $5,
        badge_text = $6,
        sort_order = $7,
        is_active = $8
       WHERE id = $9 RETURNING *`,
      [
        title !== undefined ? title.trim() : current.title,
        subtitle !== undefined ? subtitle : current.subtitle,
        cta_text !== undefined ? cta_text : current.cta_text,
        cta_link !== undefined ? cta_link : current.cta_link,
        image_url !== undefined ? image_url.trim() : current.image_url,
        badge_text !== undefined ? badge_text : current.badge_text,
        sort_order !== undefined ? sort_order : current.sort_order,
        is_active !== undefined ? is_active : current.is_active,
        req.params.id,
      ]
    );

    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM banners WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Banner bulunamadı' });
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
