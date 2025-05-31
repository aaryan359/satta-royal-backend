"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = __importDefault(require("../controllers/AdminController"));
const router = (0, express_1.Router)();
router.post('/add/market', (req, res, next) => {
    Promise.resolve(AdminController_1.default.addMarket(req, res, next)).catch(next);
});
router.post('/declare-result/:marketid', (req, res, next) => {
    Promise.resolve(AdminController_1.default.updateMarketResult(req, res, next)).catch(next);
});
router.put('/update/:marketid', (req, res, next) => {
    Promise.resolve(AdminController_1.default.updateMarket(req, res, next)).catch(next);
});
router.delete('/delete/:marketid', (req, res, next) => {
    Promise.resolve(AdminController_1.default.deleteMarket(req, res, next)).catch(next);
});
router.get('/getmarket', (req, res, next) => {
    Promise.resolve(AdminController_1.default.getMarket(req, res, next)).catch(next);
});
router.patch('/status/:marketid', (req, res, next) => {
    Promise.resolve(AdminController_1.default.updateStatus(req, res, next)).catch(next);
});
router.get('/getmarket-admin', (req, res, next) => {
    Promise.resolve(AdminController_1.default.getMarket(req, res, next)).catch(next);
});
router.get('/getmarket-admin', (req, res, next) => {
    Promise.resolve(AdminController_1.default.getMarket(req, res, next)).catch(next);
});
router.get('/gettransactions', (req, res, next) => {
    Promise.resolve(AdminController_1.default.getAllTransaction(req, res, next)).catch(next);
});
router.patch('/updatetransactionstatus/:transactionId', (req, res, next) => {
    Promise.resolve(AdminController_1.default.approvedTransaction(req, res, next)).catch(next);
});
router.get('/user-analytics', (req, res, next) => {
    Promise.resolve(AdminController_1.default.getUserAnalytics(req, res, next)).catch(next);
});
exports.default = router;
