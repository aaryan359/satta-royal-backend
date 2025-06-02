import UserModel from "../models/User.model";
import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/verifyToken";
import { IUser } from "../types/User";
import AppError from "../utils/AppError"; 

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/**
 * Middleware to authenticate user based on JWT token
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Next function to call the next middleware
 */


export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {

    // 1. Get token and check if it exists
    const token = req.headers.authorization;
    console.log(" token form frontend",token);


    if (!token) {
      return next(new AppError("You are not logged in! Please log in to get access.", 401));
    }

    // 2. Verify token
    const decoded = verifyToken(token);
    console.log(" decoded token is",decoded);
    
    if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
      return next(new AppError("Invalid token! Please log in again.", 401));
    }

    // 3. Check if user still exists
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return next(new AppError("The user belonging to this token no longer exists.", 401));
    }

    // 5. Grant access to protected route
    req.user = user;
    next();
  } catch (err) {
    next(err); // Pass any unexpected errors to the global error handler
  }
};