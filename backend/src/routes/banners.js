import { Router } from 'express';
import pool from '../db/pool.js';
import { normalizeBannerRow } from '../utils/mediaUrls.js';
import { normalizeProductRow } from '../utils/mediaUrls.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, subtitle, cta_text, cta_link, image_url, badge_text, sort_order, is_active
       FROM banners WHERE is_active = TRUE ORDER BY sort_order ASC, id ASC`
    );
    res.json({
      data: rows.map((row) => ({
        ...normalizeBannerRow(row),
        cta_link: row.cta_link || `/banner/${row.id}`,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, subtitle, cta_text, cta_link, image_url, badge_text, sort_order, is_active
       FROM banners WHERE id = $1 AND is_active = TRUE`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Banner bulunamadı' });
    const banner = normalizeBannerRow(rows[0]);
    res.json({
      data: {
        ...banner,
        cta_link: banner.cta_link || `/banner/${banner.id}`,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/products', async (req, res, next) => {
  try {
    const bannerId = parseInt(req.params.id, 10);
    if (!bannerId) return res.status(400).json({ error: 'Geçersiz banner' });

    const { rows: banners } = await pool.query(
      `SELECT id, title, subtitle, image_url FROM banners WHERE id = $1 AND is_active = TRUE`,
      [bannerId]
    );
    if (!banners.length) return res.status(404).json({ error: 'Banner bulunamadı' });

    const limitVal = Math.min(parseInt(String(req.query.limit), 10) || 100, 200);
    const { rows } = await pool.query(
      `SELECT
        p.id, p.name, p.slug, p.price, p.original_price, p.discount_percent,
        p.section, p.banner_id, p.image_url, p.images, p.rating, p.review_count, p.badge,
        p.age_range, p.color, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.banner_id = $1 AND p.in_stock = TRUE AND p.is_active = TRUE
      ORDER BY p.created_at DESC
      LIMIT $2`,
      [bannerId, limitVal]
    );

    res.json({
      data: {
        banner: normalizeBannerRow(banners[0]),
        products: rows.map(normalizeProductRow),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
