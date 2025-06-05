"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    port: Number(process.env.PORT),
    nodeEnv: (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : (() => { throw new Error('NODE_ENV is not defined'); })(),
    mongoUri: (_b = process.env.MONGODB_URI) !== null && _b !== void 0 ? _b : (() => { throw new Error('MONGODB_URI is not defined'); })(),
    jwtSecret: (_c = process.env.JWT_SECRET) !== null && _c !== void 0 ? _c : (() => { throw new Error('JWT_SECRET is not defined'); })(),
    corsOrigin: (_d = process.env.CORS_ORIGIN) !== null && _d !== void 0 ? _d : (() => { throw new Error('cors is not defined'); })(),
    google_client_id: (_e = process.env.GOOGLE_WEB_CLIENT_ID) !== null && _e !== void 0 ? _e : (() => { throw new Error('cors is not defined'); })()
};
exports.default = config;
