import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import MarketModel from '../models/Market.model';
import ApiResponse from '../utils/ApiResponse';

class MarketController {
     /**
      * Get current market result
      */
     static GetResult = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => {
          try {
               const market = await MarketModel.findOne({
               }).sort({ result_declared_at: -1 });

               console.log("market is",market)

               if (!market) {
                    return ApiResponse.error(res, {
                         message: 'No result available',
                         statusCode: 500,
                    });
               }

               ApiResponse.success(res, {
                    data: {
                         market: market.name,
                         currentResult: market.current_winning_value,
                         declaredAt: market.result_declared_at,
                    },
                    statusCode: 201,
               });
          } catch (error) {
               next(error);
          }
     };

     

     /**
      * Get result history
      */
     static GetResultHistory = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => {
          try {
               const { limit = 10 } = req.query;

               const market = await MarketModel.findOne({
                    name: req.params.marketName,
               })
                    .select('result_history')
                    .limit(Number(limit));

               if (!market) {
                    return ApiResponse.error(res, {
                         message: 'Market not found',
                    });
               }

               ApiResponse.success(res, {
                    data: market.result_history.reverse(),
                    statusCode: 201,
               });
          } catch (error) {
               next(error);
          }
     };
}

export default MarketController;
