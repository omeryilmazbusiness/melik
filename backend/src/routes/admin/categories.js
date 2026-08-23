import { Router } from 'express';
import pool from '../../db/pool.js';
import { slugify } from '../../utils/helpers.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM categories ORDER BY sort_order ASC, id ASC'
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, icon, sort_order } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Kategori adı gerekli' });

    const slug = slugify(name);
    const { rows } = await pool.query(
      `INSERT INTO categories (name, slug, icon, sort_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), slug, icon || '🏷️', sort_order ?? 99]
    );
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Bu slug zaten kullanılıyor' });
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, icon, sort_order } = req.body;
    const slug = name ? slugify(name) : undefined;

    const { rows } = await pool.query(
      `UPDATE categories SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        icon = COALESCE($3, icon),
        sort_order = COALESCE($4, sort_order)
       WHERE id = $5 RETURNING *`,
      [name?.trim(), slug, icon, sort_order, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Kategori bulunamadı' });
    res.json({ data: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Bu slug zaten kullanılıyor' });
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Kategori bulunamadı' });
    res.json({ data: { success: true } });
  } catch (err) {
    if (err.code === '23503') return res.status(409).json({ error: 'Bu kategoriye bağlı ürünler var' });
    next(err);
  }
});

export default router;
