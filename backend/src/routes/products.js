import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

const VALID_SECTIONS = ['yeni_sezon', 'firsat_urunler', 'tek_fiyat'];

function buildProductQuery(filters) {
  const conditions = ['p.in_stock = TRUE', 'p.is_active = TRUE'];
  const params = [];
  let paramIndex = 1;

  if (filters.section) {
    conditions.push(`p.section = $${paramIndex++}`);
    params.push(filters.section);
  }

  if (filters.category) {
    conditions.push(`c.slug = $${paramIndex++}`);
    params.push(filters.category);
  }

  if (filters.minPrice) {
    conditions.push(`p.price >= $${paramIndex++}`);
    params.push(parseFloat(filters.minPrice));
  }

  if (filters.maxPrice) {
    conditions.push(`p.price <= $${paramIndex++}`);
    params.push(parseFloat(filters.maxPrice));
  }

  if (filters.q) {
    conditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`);
    params.push(`%${filters.q}%`);
    paramIndex++;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  return { whereClause, params, paramIndex };
}

router.get('/', async (req, res, next) => {
  try {
    const { section, category, q, minPrice, maxPrice, limit = '20', offset = '0', sort = 'created_at' } = req.query;

    if (section && !VALID_SECTIONS.includes(section)) {
      return res.status(400).json({ error: 'Invalid section. Must be one of: yeni_sezon, firsat_urunler, tek_fiyat' });
    }

    const { whereClause, params, paramIndex } = buildProductQuery({ section, category, q, minPrice, maxPrice });

    const sortMap = {
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      rating: 'p.rating DESC',
      created_at: 'p.created_at DESC',
      name: 'p.name ASC',
    };
    const orderBy = sortMap[sort] || sortMap.created_at;

    const limitVal = Math.min(parseInt(limit, 10) || 20, 100);
    const offsetVal = parseInt(offset, 10) || 0;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;

    const dataQuery = `
      SELECT
        p.id, p.name, p.slug, p.description, p.price, p.original_price,
        p.discount_percent, p.section, p.image_url, p.images, p.rating,
        p.review_count, p.badge, p.age_range, p.color, p.in_stock,
        c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, params),
      pool.query(dataQuery, [...params, limitVal, offsetVal]),
    ]);

    res.json({
      data: dataResult.rows,
      meta: {
        total: parseInt(countResult.rows[0].total, 10),
        limit: limitVal,
        offset: offsetVal,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/sections', async (req, res, next) => {
  try {
    const sections = [
      { key: 'yeni_sezon', title: 'Yeni Sezon', subtitle: 'Trend parçalar' },
      { key: 'firsat_urunler', title: 'Günün Fırsat Ürünleri', subtitle: 'Kaçırılmayacak indirimler' },
      { key: 'tek_fiyat', title: 'Tek Fiyat Zamanı - Hepsi 200TL', subtitle: 'Sabit fiyat fırsatları' },
    ];

    const results = await Promise.all(
      sections.map(async (section) => {
        const { rows } = await pool.query(
          `SELECT
            p.id, p.name, p.slug, p.price, p.original_price, p.discount_percent,
            p.section, p.image_url, p.images, p.rating, p.review_count, p.badge,
            p.age_range, p.color, c.name as category_name, c.slug as category_slug
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.section = $1 AND p.in_stock = TRUE AND p.is_active = TRUE
          ORDER BY p.is_featured DESC, p.rating DESC
          LIMIT 12`,
          [section.key]
        );
        return { ...section, products: rows };
      })
    );

    res.json({ data: results });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug/related', async (req, res, next) => {
  try {
    const { rows: productRows } = await pool.query(
      'SELECT section, category_id FROM products WHERE slug = $1 AND is_active = TRUE',
      [req.params.slug]
    );

    if (!productRows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { section, category_id } = productRows[0];

    const { rows } = await pool.query(
      `SELECT
        p.id, p.name, p.slug, p.price, p.original_price, p.discount_percent,
        p.image_url, p.badge, p.color, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.in_stock = TRUE
        AND p.is_active = TRUE
        AND p.slug != $1
        AND (p.section = $2 OR p.category_id = $3)
      ORDER BY
        CASE WHEN p.section = $2 THEN 0 ELSE 1 END,
        p.is_featured DESC
      LIMIT 8`,
      [req.params.slug, section, category_id]
    );

    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = $1 AND p.is_active = TRUE`,
      [req.params.slug]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
