"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUser = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const verifyToken_1 = require("../utils/verifyToken");
const AppError_1 = __importDefault(require("../utils/AppError"));
/**
 * Middleware to authenticate user based on JWT token
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Next function to call the next middleware
 */
const verifyUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Get token and check if it exists
        const token = req.headers.authorization;
        console.log(" token form frontend", token);
        if (!token) {
            return next(new AppError_1.default("You are not logged in! Please log in to get access.", 401));
        }
        // 2. Verify token
        const decoded = (0, verifyToken_1.verifyToken)(token);
        console.log(" decoded token is", decoded);
        if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
            return next(new AppError_1.default("Invalid token! Please log in again.", 401));
        }
        // 3. Check if user still exists
        const user = yield User_model_1.default.findById(decoded.id);
        if (!user) {
            return next(new AppError_1.default("The user belonging to this token no longer exists.", 401));
        }
        // 5. Grant access to protected route
        req.user = user;
        next();
    }
    catch (err) {
        next(err); // Pass any unexpected errors to the global error handler
    }
});
exports.verifyUser = verifyUser;
