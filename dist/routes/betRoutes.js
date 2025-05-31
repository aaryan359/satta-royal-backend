"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authUser_1 = require("../middlewares/authUser");
const BetController_1 = __importDefault(require("../controllers/BetController"));
const router = (0, express_1.Router)();
// Route to place a bet
router.post('/place', authUser_1.verifyUser, BetController_1.default.placeBet);
// Route to get all bets for a user
router.get('/my-bets', authUser_1.verifyUser, BetController_1.default.getUserBets);
// Route to get all bets for a specific market
router.get('/market/:market', authUser_1.verifyUser, BetController_1.default.getMarketBets);
// Route to get all bets for a specific date
router.get('/date/:date', authUser_1.verifyUser, BetController_1.default.getDateBets);
exports.default = router;
