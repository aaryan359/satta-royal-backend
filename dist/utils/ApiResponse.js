"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Standardized API response utility
 */
class ApiResponse {
    /**
     * Send success response
     */
    static success(res, options) {
        const { data = null, message = 'Success', statusCode = 200, meta } = options;
        const response = {
            success: true,
            message,
            data,
        };
        if (meta) {
            response.meta = meta;
        }
        logger_1.default.info(`[API Success] ${statusCode} ${message}`);
        return res.status(statusCode).json(response);
    }
    /**
     * Send error response
     */
    static error(res, options) {
        const { error = 'Internal Server Error', message = 'An error occurred', statusCode = 500, details } = options;
        const response = {
            success: false,
            error,
            message,
        };
        if (details && process.env.NODE_ENV !== 'production') {
            response.details = details;
        }
        logger_1.default.error(`[API Error] ${statusCode} ${error}: ${message}`);
        return res.status(statusCode).json(response);
    }
    /**
     * Send paginated response
     */
    static paginated(res, options) {
        const { data, total, page, limit, message = 'Paginated data retrieved successfully', statusCode = 200, } = options;
        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;
        const response = {
            success: true,
            message,
            data,
            meta: {
                pagination: {
                    total,
                    totalPages,
                    currentPage: page,
                    limit,
                    hasNext,
                    hasPrev,
                },
            },
        };
        logger_1.default.info(`[API Paginated] ${statusCode} ${message}`);
        return res.status(statusCode).json(response);
    }
}
exports.default = ApiResponse;
