import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { MongooseError } from 'mongoose';


// Define custom error types
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Enhanced error handler
export const errorHandler = (
  err: Error | AppError | MongooseError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      const errors = Object.values((err as any).errors).map((el: any) => el.message);
      message = errors.join('. ');
    }
  } 
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${(err as any).path}: ${(err as any).value}`;
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
  else if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    statusCode = 400;
    const field = Object.keys((err as any).keyValue)[0];
    message = `${field} already exists. Please use another value.`;
    errorType = 'DuplicateFieldError';
  }

  // Log the error with request details
  logger.error({
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
    error: {
      type: errorType,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack })
    },
    timestamp: new Date().toISOString()
  });
};

// Enhanced 404 handler
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);

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

// Utility function to create consistent errors
export const createError = (statusCode: number, message: string) => {
  return new AppError(message, statusCode);
};