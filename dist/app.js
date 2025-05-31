"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const errorHandler_1 = require("./middlewares/errorHandler");
const notFound_1 = require("./middlewares/notFound");
const routes_1 = __importDefault(require("./routes"));
const dbconnect_1 = require("./config/dbconnect");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('common'));
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
(0, dbconnect_1.connectDB)().then(() => {
    console.log('MongoDB connected');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});
app.use('/api', routes_1.default);
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the Betting API'
    });
});
// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running smoothly'
    });
});
// Error Handling Middleware
app.use(notFound_1.notFound); // 404 handler
app.use(errorHandler_1.errorHandler); // Global error handler
exports.default = app;
