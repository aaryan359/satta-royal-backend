"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config/config"));
const logger_1 = __importDefault(require("./config/logger"));
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger_1.default.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});
const server = app_1.default.listen(config_1.default.port, '0.0.0.0', () => {
    logger_1.default.info(`Server running on port ${config_1.default.port}`);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger_1.default.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM received. Shutting down gracefully');
    server.close(() => {
        logger_1.default.info('Process terminated');
    });
});
