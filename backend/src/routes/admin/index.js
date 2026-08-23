import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import authRouter from './auth.js';
import categoriesRouter from './categories.js';
import campaignsRouter from './campaigns.js';
import productsRouter from './products.js';
import bannersRouter from './banners.js';
import uploadRouter from './upload.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/upload', authMiddleware, uploadRouter);
router.use('/categories', authMiddleware, categoriesRouter);
router.use('/campaigns', authMiddleware, campaignsRouter);
router.use('/products', authMiddleware, productsRouter);
router.use('/banners', authMiddleware, bannersRouter);

export default router;
