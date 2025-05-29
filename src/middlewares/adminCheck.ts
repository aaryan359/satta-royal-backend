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




export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {

    // check if is this user is admin or not
};