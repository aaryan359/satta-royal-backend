"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.notFound = exports.errorHandler = void 0;
const logger_1 = __importDefault(require("../config/logger"));
// Define custom error types
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
// Enhanced error handler
const errorHandler = (err, req, res, next) => {
    // Default error status code
    let statusCode = 500;
    let message = 'Something went wrong';
    let stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;
    let errorType = err.name || 'InternalServerError';
    // Handle different error types
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        errorType = 'ValidationError';
        // For Mongoose validation errors, extract detailed messages
        if ('errors' in err) {
            const errors = Object.values(err.errors).map((el) => el.message);
            message = errors.join('. ');
        }
    }
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
        errorType = 'CastError';
    }
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please log in again!';
        errorType = 'JsonWebTokenError';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Your token has expired! Please log in again.';
        errorType = 'TokenExpiredError';
    }
    else if (err.name === 'MongoServerError' && err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists. Please use another value.`;
        errorType = 'DuplicateFieldError';
    }
    // Log the error with request details
    logger_1.default.error({
        message: err.message,
        errorType,
        statusCode,
        path: req.path,
        method: req.method,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
        body: process.env.NODE_ENV === 'development' ? req.body : undefined
    });
    // Send error response
    res.status(statusCode).json({
        success: false,
        error: Object.assign({ type: errorType, message }, (process.env.NODE_ENV === 'development' && { stack })),
        timestamp: new Date().toISOString()
    });
};
exports.errorHandler = errorHandler;
// Enhanced 404 handler
const notFound = (req, res, next) => {
    logger_1.default.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        error: {
            type: 'NotFound',
            message: `Cannot ${req.method} ${req.originalUrl}`,
            suggestions: [
                'Check the API documentation for valid endpoints',
                'Verify the request method (GET, POST, etc.)',
                'Ensure the URL path is correct'
            ]
        },
        timestamp: new Date().toISOString()
    });
};
exports.notFound = notFound;
// Utility function to create consistent errors
const createError = (statusCode, message) => {
    return new AppError(message, statusCode);
};
exports.createError = createError;
