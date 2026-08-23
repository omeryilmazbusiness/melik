import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import categoriesRouter from './routes/categories.js';
import productsRouter from './routes/products.js';
import searchRouter from './routes/search.js';
import bannersRouter from './routes/banners.js';
import campaignsRouter from './routes/campaigns.js';
import promoTilesRouter from './routes/promoTiles.js';
import adminRouter from './routes/admin/index.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));

// JSON parser — multipart upload route'ları hariç
app.use((req, res, next) => {
  if (req.path.startsWith('/api/admin/upload')) {
    return next();
  }
  express.json({ limit: '10mb' })(req, res, next);
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/search', searchRouter);
app.use('/api/banners', bannersRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/promo-tiles', promoTilesRouter);
app.use('/api/admin', adminRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error('API Error:', err);
  const message = err.message || 'Internal server error';
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' && !err.expose ? 'Internal server error' : message,
  });
});

app.listen(PORT, () => {
  console.log(`Melik API running on http://localhost:${PORT}`);
});

export default app;
