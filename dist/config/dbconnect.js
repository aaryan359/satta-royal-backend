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
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./logger"));
const MONGODB_URI = config_1.default.mongoUri;
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!MONGODB_URI) {
            throw new Error('MongoDB connection URI not defined');
        }
        const conn = yield mongoose_1.default.connect(MONGODB_URI);
        logger_1.default.info(`MongoDB Connected: ${conn.connection.host}`);
        // Connection events
        mongoose_1.default.connection.on('connected', () => {
            logger_1.default.info('Mongoose connected to DB');
        });
        mongoose_1.default.connection.on('error', (err) => {
            logger_1.default.error(`Mongoose connection error: ${err}`);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.default.warn('Mongoose disconnected from DB');
        });
    }
    catch (err) {
        logger_1.default.error(`Database connection error: ${err}`);
        process.exit(1);
    }
});
exports.connectDB = connectDB;
const disconnectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.disconnect();
        logger_1.default.info('Database disconnected');
    }
    catch (err) {
        logger_1.default.error(`Error disconnecting from database: ${err}`);
    }
});
exports.disconnectDB = disconnectDB;
