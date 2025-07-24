// routes/userRoutes.ts
import express, { NextFunction, Request, Response } from 'express';
import UserController from '../controllers/UserController';
import { verifyUser } from '../middlewares/authUser';
import ApiResponse from '../utils/ApiResponse';

const router = express.Router();

// Public routes
router.post('/register', UserController.register as express.RequestHandler);
router.post('/login', UserController.login as express.RequestHandler);
router.post('/google-login', UserController.Oauth as express.RequestHandler);


router.post('/forgot-password', verifyUser, (req, res, next) => {
    Promise.resolve(UserController.forgotPassword(req, res, next)).catch(next);
});
router.post('/verify-otp', verifyUser, (req, res, next) => {
    Promise.resolve(UserController.verifyOtp(req, res, next)).catch(next);
});
router.post('/reset-password', verifyUser, (req, res, next) => {
    Promise.resolve(UserController.resetPassword(req, res, next)).catch(next);
});



// Protected routes (require authentication)
router.get('/check', verifyUser, async (req: Request, res: Response, next: NextFunction) => {
    ApiResponse.success(res, {
        data: req.user,
        message: "User is authenticated",
        statusCode: 201,
    });
});

router.get('/profile', verifyUser, UserController.getMe as express.RequestHandler);
router.patch('/update-profile', verifyUser, UserController.updateMe as express.RequestHandler);
router.delete('/delete-profile', verifyUser, UserController.deleteMe as express.RequestHandler);
router.patch('/balance', verifyUser, UserController.getBalance as express.RequestHandler);
router.post('/addbank', verifyUser, UserController.addBank as express.RequestHandler);

export default router;