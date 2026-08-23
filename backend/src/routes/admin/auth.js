import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../../db/pool.js';
import { authMiddleware, signToken } from '../../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
    }

    const { rows } = await pool.query(
      'SELECT id, username, name, password_hash FROM admins WHERE username = $1 AND is_active = TRUE',
      [username.trim().toLowerCase()]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }

    const token = signToken(admin);
    res.json({
      data: {
        token,
        admin: { id: admin.id, username: admin.username, name: admin.name },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, username, name FROM admins WHERE id = $1 AND is_active = TRUE',
      [req.admin.id]
    );
    if (!rows.length) return res.status(401).json({ error: 'Admin bulunamadı' });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
