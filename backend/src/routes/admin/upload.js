import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { saveUploadedFile } from '../../utils/uploads.js';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece görsel dosyaları yüklenebilir (jpg, png, webp, gif, heic)'));
    }
  },
});

const router = Router();

router.post('/', (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'Görsel dosyası alınamadı. Lütfen geçerli bir görsel seçin.',
      });
    }

    try {
      const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
      const saved = await saveUploadedFile({
        filename,
        mimeType: req.file.mimetype,
        buffer: req.file.buffer,
      });

      res.status(201).json({
        data: { url: saved.url, filename: saved.filename },
      });
    } catch (e) {
      console.error('Upload save failed:', e);
      res.status(500).json({ error: 'Görsel kaydedilemedi' });
    }
  });
});

export default router;
