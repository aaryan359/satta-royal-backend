import { Router } from 'express';
import AdminController from '../controllers/AdminController';
import { verifyUser } from '../middlewares/authUser';


const router = Router();
 
router.get('/getmarket', verifyUser, (req, res, next) => {
  Promise.resolve(AdminController.getMarket(req, res, next)).catch(next);
});



export default router;