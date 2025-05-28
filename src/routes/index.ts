import { Router } from 'express';
import userRoutes from './userRoutes';
import marketRoutes from './marketRoutes'
import betRoutes from './betRoutes';
import walletRoutes from './walletRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', userRoutes);
router.use('/market', marketRoutes);
router.use('/bets', betRoutes);
router.use('/wallet', walletRoutes);
router.use('/admin', adminRoutes);

export default router;

