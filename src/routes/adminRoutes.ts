import { Router } from 'express';
import express from 'express';
import AdminController from '../controllers/AdminController';

const router = Router();



router.post('/add/market', (req, res, next) => {
  Promise.resolve(AdminController.addMarket(req, res, next)).catch(next);
});


router.post('/declare-result/:marketid', (req, res, next) => {
  Promise.resolve(AdminController.updateMarketResult(req, res, next)).catch(next);
});

router.put('/update/:marketid', (req, res, next) => {
  Promise.resolve(AdminController.updateMarket(req, res, next)).catch(next);
});

router.delete('/delete/:marketid', (req, res, next) => {
  Promise.resolve(AdminController.deleteMarket(req, res, next)).catch(next);
});

router.get('/getmarket', (req, res, next) => {
  Promise.resolve(AdminController.getMarket(req, res, next)).catch(next);
});

router.patch('/status/:marketid', (req, res, next) => {
  Promise.resolve(AdminController.updateStatus(req, res, next)).catch(next);
})

router.get('/getmarket-admin', (req, res, next) => {
  Promise.resolve(AdminController.getMarket(req, res, next)).catch(next);
});

router.get('/getmarket-admin', (req, res, next) => {
  Promise.resolve(AdminController.getMarket(req, res, next)).catch(next);
});

router.get('/gettransactions',(req, res, next) => {
  Promise.resolve(AdminController.getAllTransaction(req, res, next)).catch(next);
})

router.patch('/updatetransactionstatus/:transactionId',(req, res, next) => {
  Promise.resolve(AdminController.approvedTransaction(req, res, next)).catch(next);
})


router.get('/user-analytics',(req, res, next) => {
  Promise.resolve(AdminController.getUserAnalytics(req, res, next)).catch(next);

})





export default router;