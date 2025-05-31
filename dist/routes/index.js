"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRoutes_1 = __importDefault(require("./userRoutes"));
const marketRoutes_1 = __importDefault(require("./marketRoutes"));
const betRoutes_1 = __importDefault(require("./betRoutes"));
const walletRoutes_1 = __importDefault(require("./walletRoutes"));
const adminRoutes_1 = __importDefault(require("./adminRoutes"));
const router = (0, express_1.Router)();
router.use('/auth', userRoutes_1.default);
router.use('/market', marketRoutes_1.default);
router.use('/bets', betRoutes_1.default);
router.use('/wallet', walletRoutes_1.default);
router.use('/admin', adminRoutes_1.default);
exports.default = router;
