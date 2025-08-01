"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Middleware to handle 404 Not Found errors
 *
 * This should be placed after all your routes but before error handlers
 */
const notFound = (req, res, next) => {
    // Log the 404 attempt
    logger_1.default.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
    // Create error response
    const error = new Error(`Not Found - ${req.method} ${req.originalUrl}`);
    res.status(404);
    // Format response based on Accept header
    if (req.accepts('json')) {
        res.json({
            success: false,
            error: 'Not Found',
            message: `The requested resource ${req.originalUrl} was not found`,
            statusCode: 404,
            timestamp: new Date().toISOString()
        });
    }
    else {
        res.type('txt').send('Not Found');
    }
    // Pass to next middleware (though typically this ends the chain)
    next(error);
};
exports.notFound = notFound;
// Alternative version for simpler implementation:
/*
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    path: req.originalUrl,
    method: req.method
  });
};
*/ 
