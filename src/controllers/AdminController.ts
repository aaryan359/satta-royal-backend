import { Request, Response, NextFunction } from 'express';
import ApiResponse from '../utils/ApiResponse';
import MarketModel from '../models/Market.model';

class AdminController {
     /**
      * update the result of a market
      */
     static updateMarketResult = async (
          req: Request, res: Response, next: NextFunction
     ) => {
          try {
               const { marketId, result } = req.body;

               console.log("req.body is", req.body)

               // Validate input
               if (!marketId || !result) {
                    return ApiResponse.error(res, {
                         error: 'Validation Error',
                         message: 'Market ID and result are required.',
                         statusCode: 400,
                    });
               }

               // Find the market and update the result
               const market = await MarketModel.findById(marketId);
               if (!market) {
                    return ApiResponse.error(res, {
                         error: 'Not Found',
                         message: 'Market not found.',
                         statusCode: 404,
                    });
               }

               market.result = result;
               await market.save();

               return ApiResponse.success(res, {
                    data: market,
                    message: 'Market result updated successfully',
                    statusCode: 200,
               });
          } catch (error: any) {
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
          req: Request, res: Response, next: NextFunction
     ) => {
          try {
               const { name, active_hours, Id } = req.body;
               console.log(`req body is `, req.body)


               // Validate input
               if (!name || !active_hours) {
                    return ApiResponse.error(res, {
                         error: 'Validation Error',
                         message: 'All fields are required.',
                         statusCode: 400,
                    });
               }

               // Create new market
               const newMarket = new MarketModel({
                    name,
                    active_hours,
                    odds: 1.5,
                    allowed_values: [
                         0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
                         16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
                         30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43,
                         44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
                         58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71,
                         72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85,
                         86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
                    ],
                    result: null,
                    result_declared_at: null,
               });

               await newMarket.save();

               return ApiResponse.success(res, {
                    data: newMarket,
                    message: 'Market created successfully',
                    statusCode: 201,
               });
          } catch (error: any) {
               return ApiResponse.error(res, {
                    error: 'Database Error',
                    message: error.message,
               });
          }
     };

     /**
      * get all the market
      */

     static getMarket = async (
          req: Request, res: Response, next: NextFunction
     ) => {
          try {

               const markets = await MarketModel.find({});


               if (markets) {
                    return ApiResponse.success(res,
                         {
                              data: markets,
                              statusCode: 201,
                              message: "Market reterive sussesfully"
                         }
                    )
               }

          } catch (error: any) {
               return ApiResponse.error(res,
                    {
                         message: error.message
                    }
               )

          }


     }


}


export default AdminController;