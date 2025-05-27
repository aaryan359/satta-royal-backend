import { Router } from 'express';
import express from 'express';
import { verifyUser } from '../middlewares/authUser';
import BetController from '../controllers/BetController';



const router = Router();
// Route to place a bet
router.post('/place', verifyUser, BetController.placeBet as express.RequestHandler);







export default router;