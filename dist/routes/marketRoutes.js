"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = __importDefault(require("../controllers/AdminController"));
const authUser_1 = require("../middlewares/authUser");
const router = (0, express_1.Router)();
router.get('/getmarket', authUser_1.verifyUser, (req, res, next) => {
    Promise.resolve(AdminController_1.default.getMarket(req, res, next)).catch(next);
});
exports.default = router;
