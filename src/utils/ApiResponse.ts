import { Response } from 'express';
import logger from '../config/logger';

/**
 * Standardized API response utility
 */
class ApiResponse {
    /**
     * Send success response
     */
static success(res: Response, options: {
        data?: any;
        message?: string;
        statusCode?: number;
        meta?: Record<string, any>;
    }) {
        const { data = null, message = 'Success', statusCode = 200, meta } = options;

        const response: Record<string, any> = {
            success: true,
            message,
            data,
        };

        if (meta) {
            response.meta = meta;
        }

        logger.info(`[API Success] ${statusCode} ${message}`);
        return res.status(statusCode).json(response);
    }

    /**
     * Send error response
     */
    static error(res: Response, options: {
        error?: string;
        message?: string;
        statusCode?: number;
        details?: any;
    }) {
        const {
            error = 'Internal Server Error',
            message = 'An error occurred',
            statusCode = 500,
            details
        } = options;

        const response: Record<string, any> = {
            success: false,
            error,
            message,
        };

        if (details && process.env.NODE_ENV !== 'production') {
            response.details = details;
        }

        logger.error(`[API Error] ${statusCode} ${error}: ${message}`);
        return res.status(statusCode).json(response);
    }

    /**
     * Send paginated response
     */
    static paginated(
        res: Response,
        options: {
            data: any[];
            total: number;
            page: number;
            limit: number;
            message?: string;
            statusCode?: number;
        }
    ) {
        const {
            data,
            total,
            page,
            limit,
            message = 'Paginated data retrieved successfully',
            statusCode = 200,
        } = options;

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

        logger.info(`[API Paginated] ${statusCode} ${message}`);
        return res.status(statusCode).json(response);
    }
}

export default ApiResponse;