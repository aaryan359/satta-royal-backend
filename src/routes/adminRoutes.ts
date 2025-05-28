import { Router } from 'express';
import express from 'express';
import AdminController from '../controllers/AdminController';

const router = Router();

router.post('/add/market', (req, res, next) => {
  Promise.resolve(AdminController.addMarket(req, res, next)).catch(next);
});
router.post('/update-result', (req, res, next) => {
  Promise.resolve(AdminController.updateMarketResult(req, res, next)).catch(next);
});
router.get('/getmarket', (req, res, next) => {
  Promise.resolve(AdminController.getMarket(req, res, next)).catch(next);
});



export default router;