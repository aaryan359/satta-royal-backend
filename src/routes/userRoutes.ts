// routes/userRoutes.ts
import express from 'express';
import UserController from '../controllers/UserController';
import { verifyUser } from '../middlewares/authUser';

const router = express.Router();


//public routes
router.post('/register', UserController.register as express.RequestHandler);
router.post('/login', UserController.login as express.RequestHandler);

// router.post('/forgot-password', UserController.forgotPassword as express.RequestHandler);
// router.post('/reset-password', UserController.resetPassword as express.RequestHandler);


router.get('/profile',verifyUser, UserController.getMe as express.RequestHandler);
router.patch('/update-profile', verifyUser, UserController.updateMe as express.RequestHandler);
router.delete('/delete-profile', verifyUser, UserController.deleteMe as express.RequestHandler);
router.patch('/balance', verifyUser, UserController.getBalance as express.RequestHandler);

    


export default router;