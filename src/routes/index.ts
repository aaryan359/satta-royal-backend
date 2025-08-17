import { Router } from 'express';
import userRoutes from './userRoutes';
import marketRoutes from './marketRoutes'
import betRoutes from './betRoutes';
import walletRoutes from './walletRoutes';
import adminRoutes from './adminRoutes';
import dashboard from './DashboardRoutes'

const router = Router();


console.log(" came in thrindex .ts");


router.use('/auth', userRoutes);
router.use('/market', marketRoutes);
router.use('/bets', betRoutes);
router.use('/wallet', walletRoutes);
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboard);



export default router;

