import { Router } from 'express';
import TransactionController from '../controllers/TransactionController';
import { verifyUser } from '../middlewares/authUser';
const router = Router();

router.post('/deposit',verifyUser, (req, res, next) => {
  Promise.resolve(TransactionController.depositMoney(req, res, next)).catch(next);
})

router.post('/bonus',verifyUser, (req, res, next) => {
  Promise.resolve(TransactionController.depositBonus(req, res, next)).catch(next);
})

router.post('/withdraw',verifyUser, (req, res, next) => {
  Promise.resolve(TransactionController.withdrawMoney(req, res, next)).catch(next);
})


router.get('/getrecenttransaction',verifyUser, (req, res, next) => {
  Promise.resolve(TransactionController.getRecentTransactions(req, res, next)).catch(next);
})



router.get('/transaction/:transactionId',verifyUser, (req, res, next) => {
  Promise.resolve(TransactionController.getTransactionDetails(req, res, next)).catch(next);
})



export default router;