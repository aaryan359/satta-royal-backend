import BetModel from '../models/Bet.model';
import { Request, Response, NextFunction } from 'express';
import ApiResponse from '../utils/ApiResponse';
import UserModel from '../models/User.model';


class AdminController {
     /**
      * update the result of a market
      */
     static updateMarketResult = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => {
          try {
               const { marketId, result } = req.body;

               // Validate input
               if (!marketId || !result) {
                    return ApiResponse.error(res, {
                         error: 'Validation Error',
                         message: 'Market ID and result are required.',
                         statusCode: 400,
                    });
               }

               // Find the market and update the result
               const market = await BetModel.findById(marketId);
               if (!market) {
                    return ApiResponse.error(res, {
                         error: 'Not Found',
                         message: 'Market not found.',
                         statusCode: 404,
                    });
               }

               market.result = result;
               await market.save();

               return ApiResponse.success(res, { data: market });
          } catch (error) {
               return ApiResponse.error(res, {
                    error: 'Database Error',
                    message: error.message,
               });
          }
     };
     /**
      * add new market
      */
     static addMarket = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => {
          try {
               const { name, active_hours, allowed_values } = req.body;

               // Validate input
               if (!name || !active_hours || !allowed_values) {
                    return ApiResponse.error(res, {
                         error: 'Validation Error',
                         message: 'All fields are required.',
                         statusCode: 400,
                    });
               }

               // Create new market
               const newMarket = new BetModel({
                    name,
                    active_hours,
                    allowed_values,
               });

               await newMarket.save();

               return ApiResponse.success(res, {
                    data: newMarket,
                    message: 'Market created successfully',
                    statusCode: 201,
               });
          } catch (error) {
               return ApiResponse.error(res, {
                    error: 'Database Error',
                    message: error.message,
               });
          }
     };
}
