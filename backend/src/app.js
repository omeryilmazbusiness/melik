import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import categoriesRouter from './routes/categories.js';
import productsRouter from './routes/products.js';
import searchRouter from './routes/search.js';
import bannersRouter from './routes/banners.js';
import campaignsRouter from './routes/campaigns.js';
import promoTilesRouter from './routes/promoTiles.js';
import adminRouter from './routes/admin/index.js';
import { getUploadDir } from './utils/uploads.js';

dotenv.config();

export function createApp() {
  const app = express();

  const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  }));

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes('*') || corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
  }));

  app.use((req, res, next) => {
    if (req.path.startsWith('/api/admin/upload')) {
      return next();
    }
    express.json({ limit: '10mb' })(req, res, next);
  });

  app.use('/uploads', express.static(getUploadDir()));

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

  return app;
}
