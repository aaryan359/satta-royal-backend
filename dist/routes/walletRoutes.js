"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TransactionController_1 = __importDefault(require("../controllers/TransactionController"));
const authUser_1 = require("../middlewares/authUser");
const router = (0, express_1.Router)();
router.post('/deposit', authUser_1.verifyUser, (req, res, next) => {
    Promise.resolve(TransactionController_1.default.depositMoney(req, res, next)).catch(next);
});
router.get('/getrecenttransaction', authUser_1.verifyUser, (req, res, next) => {
    Promise.resolve(TransactionController_1.default.getRecentTransactions(req, res, next)).catch(next);
});
router.get('/transaction/:transactionId', authUser_1.verifyUser, (req, res, next) => {
    Promise.resolve(TransactionController_1.default.getTransactionDetails(req, res, next)).catch(next);
});
exports.default = router;
