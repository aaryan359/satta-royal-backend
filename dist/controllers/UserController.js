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
const User_model_1 = __importDefault(require("../models/User.model"));
const logger_1 = __importDefault(require("../config/logger"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const genrate_jwt_1 = require("../utils/genrate-jwt");
const config_1 = __importDefault(require("../config/config"));
const google_auth_library_1 = require("google-auth-library");
const UserController = {
    /**
     * Register a new user
     */
    register: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { username, email, password, phone } = req.body;
            console.log(`Registering user with email: ${email}, username: ${username}`);
            console.log(`Request body: ${JSON.stringify(req.body)}`);
            // Check if username, email, and password are provided
            if (!username || !email || !password) {
                return ApiResponse_1.default.error(res, {
                    error: 'Validation Error',
                    message: 'Please provide username, email, and password',
                    statusCode: 400
                });
            }
            // Check if user already exists
            const existingUser = yield User_model_1.default.findOne({ $or: [{ email }, { username }] });
            if (existingUser) {
                return ApiResponse_1.default.error(res, {
                    error: 'Validation Error',
                    message: 'Email or username already in use',
                    statusCode: 400
                });
            }
            // Create new user
            const newUser = yield User_model_1.default.create({
                username,
                email,
                password,
                phone
            });
            // Generate JWT token
            const token = (0, genrate_jwt_1.generateToken)(newUser._id);
            console.log(`Generated token: ${token}`);
            return ApiResponse_1.default.success(res, {
                message: 'User registered successfully',
                data: {
                    user: newUser,
                    token
                },
                statusCode: 201
            });
        }
        catch (error) {
            console.log(`Registration error: ${error.message}`);
            next(error);
        }
    }),
    /**
     * Login user
     */
    login: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return ApiResponse_1.default.error(res, {
                    error: 'Validation Error',
                    message: 'Please provide email and password',
                    statusCode: 400
                });
            }
            const user = yield User_model_1.default.findOne({ email });
            if (!user) {
                return ApiResponse_1.default.error(res, {
                    error: ' User not found',
                    message: 'User not found',
                    statusCode: 401
                });
            }
            const token = (0, genrate_jwt_1.generateToken)(user._id);
            return ApiResponse_1.default.success(res, {
                message: 'User logged in successfully',
                data: {
                    user,
                    token
                },
                statusCode: 200
            });
        }
        catch (error) {
            logger_1.default.error(`Login error: ${error.message}`);
            next(error);
        }
    }),
    /**
     * Get current user profile
     */
    getMe: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user = yield User_model_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
            if (!user) {
                return ApiResponse_1.default.error(res, {
                    error: 'User not found',
                    message: 'No user found with this ID',
                    statusCode: 404
                });
            }
            return ApiResponse_1.default.success(res, {
                message: 'User profile retrieved successfully',
                data: user,
                statusCode: 200
            });
        }
        catch (error) {
            logger_1.default.error(`Get profile error: ${error.message}`);
            next(error);
        }
    }),
    /**
     * Update user profile
     */
    updateMe: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // Filter out unwanted fields
            const filteredBody = {};
            const allowedFields = ['username', 'email', 'avatar'];
            Object.keys(req.body).forEach(key => {
                if (allowedFields.includes(key)) {
                    filteredBody[key] = req.body[key];
                }
            });
            const updatedUser = yield User_model_1.default.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a._id, filteredBody, { new: true, runValidators: true });
            return ApiResponse_1.default.success(res, {
                message: 'User profile updated successfully',
                data: updatedUser,
                statusCode: 200
            });
        }
        catch (error) {
            logger_1.default.error(`Update profile error: ${error.message}`);
            next(error);
        }
    }),
    /**
     * Delete user account
     */
    deleteMe: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            yield User_model_1.default.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a._id, { active: false });
            return ApiResponse_1.default.success(res, {
                message: 'User account deleted successfully',
                statusCode: 200
            });
        }
        catch (error) {
            logger_1.default.error(`Delete account error: ${error.message}`);
            next(error);
        }
    }),
    /**
     * Submit KYC documents
     */
    submitKYC: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { idNumber, idType, idFront, idBack } = req.body;
            const updatedUser = yield User_model_1.default.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a._id, {
                kycStatus: 'pending',
                kycDocuments: {
                    idNumber,
                    idType,
                    idFront,
                    idBack
                }
            }, { new: true });
            return ApiResponse_1.default.success(res, {
                message: 'KYC documents submitted successfully',
                data: updatedUser,
                statusCode: 200
            });
        }
        catch (error) {
            logger_1.default.error(`KYC submission error: ${error.message}`);
            next(error);
        }
    }),
    /**
     * Update user balance (for admin only)
     */
    updateBalance: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId, amount } = req.body;
            const user = yield User_model_1.default.findByIdAndUpdate(userId, { $inc: { balance: amount } }, { new: true });
            return ApiResponse_1.default.success(res, {
                message: 'Balance updated successfully',
                data: user,
                statusCode: 200
            });
        }
        catch (error) {
            logger_1.default.error(`Balance update error: ${error.message}`);
            next(error);
        }
    }),
    getBalance: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user = yield User_model_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select('balance');
            if (!user) {
                return ApiResponse_1.default.error(res, {
                    error: 'User not found',
                    message: 'No user found with this ID',
                    statusCode: 404
                });
            }
            return ApiResponse_1.default.success(res, {
                message: 'Balance retrieved successfully',
                data: { balance: user.balance }
            });
        }
        catch (error) {
            logger_1.default.error(`Get balance error: ${error.message}`);
            next(error);
        }
    }),
    Oauth: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const client = new google_auth_library_1.OAuth2Client(config_1.default.google_client_id);
        console.log('req body', req.body);
        const { token, user } = req.body;
        console.log('token and mail is', token, user);
        try {
            const ticket = yield client.verifyIdToken({
                idToken: token,
                audience: config_1.default.google_client_id,
            });
            const payload = ticket.getPayload();
            console.log('payload from google is', payload);
            // Check email match
            if ((payload === null || payload === void 0 ? void 0 : payload.email) !== user.email) {
                return res.status(401).json({ error: 'Email mismatch' });
            }
            const email = payload === null || payload === void 0 ? void 0 : payload.email;
            const username = payload === null || payload === void 0 ? void 0 : payload.name;
            const profile = payload === null || payload === void 0 ? void 0 : payload.profile;
            const dbUser = yield User_model_1.default.findOne({ email });
            // if user already registered
            if (dbUser) {
                const token = (0, genrate_jwt_1.generateToken)(dbUser._id);
                return ApiResponse_1.default.success(res, {
                    message: 'User logged in successfully',
                    data: {
                        dbUser,
                        token
                    },
                    statusCode: 200
                });
            }
            // if fresh user came
            // Create new user
            if (!dbUser) {
                const newUser = yield User_model_1.default.create({
                    email,
                    username,
                    profilePicture: profile,
                });
                // Generate JWT token
                const token = (0, genrate_jwt_1.generateToken)(newUser._id);
                console.log(`Generated token: ${token}`);
                return ApiResponse_1.default.success(res, {
                    message: 'User registered successfully',
                    data: {
                        user: newUser,
                        token
                    },
                    statusCode: 201
                });
            }
        }
        catch (err) {
            ApiResponse_1.default.error(res, {
                error: 'Invalid ID token',
                statusCode: 401
            });
        }
    })
};
exports.default = UserController;
