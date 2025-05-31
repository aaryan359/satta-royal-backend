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
// routes/userRoutes.ts
const express_1 = __importDefault(require("express"));
const UserController_1 = __importDefault(require("../controllers/UserController"));
const authUser_1 = require("../middlewares/authUser");
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const router = express_1.default.Router();
//public routes
router.post('/register', UserController_1.default.register);
router.post('/login', UserController_1.default.login);
// router.post('/forgot-password', UserController.forgotPassword as express.RequestHandler);
// router.post('/reset-password', UserController.resetPassword as express.RequestHandler);
// for checking that user is authenticated or not
router.get('/check', authUser_1.verifyUser, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    ApiResponse_1.default.success(res, {
        data: req.user,
        message: "User is authenticated",
        statusCode: 201,
    });
}));
router.get('/profile', authUser_1.verifyUser, UserController_1.default.getMe);
router.patch('/update-profile', authUser_1.verifyUser, UserController_1.default.updateMe);
router.delete('/delete-profile', authUser_1.verifyUser, UserController_1.default.deleteMe);
router.patch('/balance', authUser_1.verifyUser, UserController_1.default.getBalance);
exports.default = router;
