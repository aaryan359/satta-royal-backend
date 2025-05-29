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
   static addMarket = async (req: Request, res: Response, next: NextFunction) => {
     try {
          const { name, active_hours, code } = req.body;
          console.log('req body is', req.body);

          // Validate input presence
          if (!name || !active_hours || !code) {
               return ApiResponse.error(res, {
                    error: 'Validation Error',
                    message: 'All fields (name, active_hours, code) are required.',
                    statusCode: 400,
               });
          }

          const { open, close } = active_hours;

          // Validate time format HH:mm (24-hour)
          const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
          if (!timeRegex.test(open) || !timeRegex.test(close)) {
               return ApiResponse.error(res, {
                    error: 'Validation Error',
                    message: 'Time format must be HH:mm (e.g., "06:00", "21:00").',
                    statusCode: 400,
               });
          }

          // Convert to minutes since midnight
          const [openH, openM] = open.split(':').map(Number);
          const [closeH, closeM] = close.split(':').map(Number);
          const openMinutes = openH * 60 + openM;
          const closeMinutes = closeH * 60 + closeM;

          if (closeMinutes <= openMinutes) {
               return ApiResponse.error(res, {
                    error: 'Validation Error',
                    message: 'Closing time must be after opening time.',
                    statusCode: 400,
               });
          }

          // Calculate odds: 950 payout for 10 bet => 950 / 10 = 95
          const odds = 95;

          const newMarket = new MarketModel({
               name,
               code,
               active_hours: {
                    open,  // store as string "HH:mm"
                    close, // store as string "HH:mm"
               },
               odds,
               allowed_values: Array.from({ length: 100 }, (_, i) => i),
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