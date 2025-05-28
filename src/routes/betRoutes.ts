import { Router } from 'express';
import express from 'express';
import { verifyUser } from '../middlewares/authUser';
import BetController from '../controllers/BetController';



const router = Router();
// Route to place a bet
router.post('/place', verifyUser, BetController.placeBet as express.RequestHandler);
// Route to get all bets for a user
router.get('/my-bets', verifyUser, BetController.getUserBets as express.RequestHandler);
// Route to get all bets for a specific market
router.get('/market/:market', verifyUser, BetController.getMarketBets as express.RequestHandler);
// Route to get all bets for a specific date
router.get('/date/:date', verifyUser, BetController.getDateBets as express.RequestHandler);



export default router;