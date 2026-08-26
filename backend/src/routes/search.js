import { Router } from 'express';
import pool from '../db/pool.js';
import { normalizeProductRow } from '../utils/mediaUrls.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { q, category, section, minPrice, maxPrice, limit = '10' } = req.query;

    if (!q && !category && !section) {
      return res.status(400).json({
        error: 'At least one search parameter is required (q, category, or section)',
      });
    }

    const conditions = ['p.in_stock = TRUE', 'p.is_active = TRUE'];
    const params = [];
    let paramIndex = 1;

    if (q) {
      conditions.push(`(
        p.name ILIKE $${paramIndex}
        OR p.description ILIKE $${paramIndex}
        OR c.name ILIKE $${paramIndex}
        OR p.color ILIKE $${paramIndex}
        OR p.age_range ILIKE $${paramIndex}
      )`);
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (category) {
      conditions.push(`c.slug = $${paramIndex++}`);
      params.push(category);
    }

    if (section) {
      conditions.push(`p.section = $${paramIndex++}`);
      params.push(section);
    }

    if (minPrice) {
      conditions.push(`p.price >= $${paramIndex++}`);
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      conditions.push(`p.price <= $${paramIndex++}`);
      params.push(parseFloat(maxPrice));
    }

    const limitVal = Math.min(parseInt(limit, 10) || 10, 50);

    const query = `
      SELECT
        p.id, p.name, p.slug, p.price, p.original_price, p.discount_percent,
        p.section, p.image_url, p.rating, p.review_count, p.badge,
        p.age_range, p.color, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY p.rating DESC, p.name ASC
      LIMIT $${paramIndex}
    `;

    const result = await pool.query(query, [...params, limitVal]);

    res.json({
      data: result.rows.map(normalizeProductRow),
      meta: {
        query: q || null,
        category: category || null,
        section: section || null,
        count: result.rows.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/suggestions', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ data: [] });
    }

    const { rows } = await pool.query(
      `SELECT DISTINCT p.name, p.slug, p.image_url, p.price, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.in_stock = TRUE AND p.is_active = TRUE AND (
         p.name ILIKE $1 OR c.name ILIKE $1 OR p.color ILIKE $1
       )
       ORDER BY p.name ASC
       LIMIT 8`,
      [`%${q}%`]
    );

    res.json({ data: rows.map(normalizeProductRow) });
  } catch (err) {
    next(err);
  }
});

export default router;
