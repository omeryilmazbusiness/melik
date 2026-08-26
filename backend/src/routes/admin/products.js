import { Router } from 'express';
import pool from '../../db/pool.js';
import { slugify, computeDiscountPercent, PRODUCT_SECTIONS, parseOptionalSection } from '../../utils/helpers.js';

const router = Router();

function parseOptionalBannerId(value) {
  if (value === undefined) return { unset: true, value: undefined };
  if (value === null || value === '' || value === 0 || value === '0') return { unset: false, value: null };
  const id = parseInt(value, 10);
  if (!Number.isFinite(id) || id < 1) return { unset: false, invalid: true, value: null };
  return { unset: false, value: id };
}

router.get('/sections', (_req, res) => {
  res.json({ data: PRODUCT_SECTIONS });
});

router.get('/', async (req, res, next) => {
  try {
    const { section, category, banner, q, limit = '50', offset = '0' } = req.query;
    const conditions = ['p.is_active = TRUE'];
    const params = [];
    let idx = 1;

    if (section) { conditions.push(`p.section = $${idx++}`); params.push(section); }
    if (category) { conditions.push(`c.slug = $${idx++}`); params.push(category); }
    if (banner) { conditions.push(`p.banner_id = $${idx++}`); params.push(parseInt(banner, 10)); }
    if (q) {
      conditions.push(`(p.name ILIKE $${idx} OR p.model ILIKE $${idx})`);
      params.push(`%${q}%`);
      idx++;
    }

    const limitVal = Math.min(parseInt(limit, 10) || 50, 200);
    const offsetVal = parseInt(offset, 10) || 0;

    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
              b.title as banner_title
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN banners b ON p.banner_id = b.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limitVal, offsetVal]
    );

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE ${conditions.join(' AND ')}`,
      params
    );

    res.json({
      data: rows,
      meta: { total: parseInt(countRes.rows[0].count, 10), limit: limitVal, offset: offsetVal },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
              b.title as banner_title
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN banners b ON p.banner_id = b.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Ürün bulunamadı' });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const p = req.body;
    if (!p.name?.trim()) return res.status(400).json({ error: 'Ürün adı gerekli' });
    if (!p.price) return res.status(400).json({ error: 'Fiyat gerekli' });
    if (!p.image_url?.trim()) return res.status(400).json({ error: 'Görsel gerekli' });

    const sectionParsed = parseOptionalSection(p.section ?? null);
    if (!sectionParsed.ok) {
      return res.status(400).json({ error: 'Geçerli bir kampanya seçin veya boş bırakın' });
    }

    const bannerParsed = parseOptionalBannerId(p.banner_id ?? null);
    if (bannerParsed.invalid) {
      return res.status(400).json({ error: 'Geçersiz banner' });
    }

    const slug = p.slug?.trim() || slugify(p.name);
    const discountPercent = computeDiscountPercent(Number(p.price), p.original_price ? Number(p.original_price) : null);

    const { rows } = await pool.query(
      `INSERT INTO products (
        name, slug, subtitle, description, detail, price, original_price, discount_percent,
        section, category_id, banner_id, image_url, images, badge, age_range, color, brand, model,
        sizes, color_variants, features, in_stock, is_featured
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
      RETURNING *`,
      [
        p.name.trim(),
        slug,
        p.subtitle || null,
        p.description || p.detail || null,
        p.detail || p.description || null,
        Number(p.price),
        p.original_price ? Number(p.original_price) : null,
        discountPercent,
        sectionParsed.value,
        p.category_id || null,
        bannerParsed.value,
        p.image_url,
        JSON.stringify(p.images || [p.image_url]),
        p.badge || null,
        p.age_range || null,
        p.color || null,
        p.brand || 'Şirin Kids',
        p.model || null,
        JSON.stringify(p.sizes || []),
        JSON.stringify(p.color_variants || []),
        JSON.stringify(p.features || []),
        p.in_stock !== false,
        p.is_featured === true,
      ]
    );

    res.status(201).json({ data: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Bu slug zaten kullanılıyor' });
    if (err.code === '23503') return res.status(400).json({ error: 'Seçilen banner bulunamadı' });
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const p = req.body;
    const discountPercent = p.price !== undefined
      ? computeDiscountPercent(Number(p.price), p.original_price ? Number(p.original_price) : null)
      : undefined;

    const hasSection = Object.prototype.hasOwnProperty.call(p, 'section');
    const sectionParsed = hasSection ? parseOptionalSection(p.section) : { ok: true, value: null };
    if (!sectionParsed.ok) {
      return res.status(400).json({ error: 'Geçerli bir kampanya seçin veya boş bırakın' });
    }

    const hasBanner = Object.prototype.hasOwnProperty.call(p, 'banner_id');
    const bannerParsed = hasBanner ? parseOptionalBannerId(p.banner_id) : { unset: true, value: null };
    if (bannerParsed.invalid) {
      return res.status(400).json({ error: 'Geçersiz banner' });
    }

    const { rows } = await pool.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        subtitle = COALESCE($3, subtitle),
        description = COALESCE($4, description),
        detail = COALESCE($5, detail),
        price = COALESCE($6, price),
        original_price = $7,
        discount_percent = COALESCE($8, discount_percent),
        section = CASE WHEN $9 THEN $10 ELSE section END,
        category_id = COALESCE($11, category_id),
        banner_id = CASE WHEN $12 THEN $13 ELSE banner_id END,
        image_url = COALESCE($14, image_url),
        images = COALESCE($15, images),
        badge = $16,
        age_range = COALESCE($17, age_range),
        color = COALESCE($18, color),
        brand = COALESCE($19, brand),
        model = $20,
        sizes = COALESCE($21, sizes),
        color_variants = COALESCE($22, color_variants),
        features = COALESCE($23, features),
        in_stock = COALESCE($24, in_stock),
        is_featured = COALESCE($25, is_featured),
        updated_at = NOW()
       WHERE id = $26 RETURNING *`,
      [
        p.name?.trim(),
        p.slug?.trim() || (p.name ? slugify(p.name) : undefined),
        p.subtitle,
        p.description,
        p.detail,
        p.price !== undefined ? Number(p.price) : undefined,
        p.original_price !== undefined ? (p.original_price ? Number(p.original_price) : null) : undefined,
        discountPercent,
        hasSection,
        hasSection ? sectionParsed.value : null,
        p.category_id,
        hasBanner,
        hasBanner ? bannerParsed.value : null,
        p.image_url,
        p.images ? JSON.stringify(p.images) : undefined,
        p.badge !== undefined ? p.badge : undefined,
        p.age_range,
        p.color,
        p.brand,
        p.model !== undefined ? p.model : undefined,
        p.sizes ? JSON.stringify(p.sizes) : undefined,
        p.color_variants ? JSON.stringify(p.color_variants) : undefined,
        p.features ? JSON.stringify(p.features) : undefined,
        p.in_stock,
        p.is_featured,
        req.params.id,
      ]
    );

    if (!rows.length) return res.status(404).json({ error: 'Ürün bulunamadı' });
    res.json({ data: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Bu slug zaten kullanılıyor' });
    if (err.code === '23503') return res.status(400).json({ error: 'Seçilen banner bulunamadı' });
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE products
       SET is_active = FALSE, updated_at = NOW()
       WHERE id = $1 AND is_active = TRUE`,
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Ürün bulunamadı' });
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
