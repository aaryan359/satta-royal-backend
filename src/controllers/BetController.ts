import BetModel from "../models/Bet.model";


import { Request, Response, NextFunction } from "express";
import ApiResponse from "../utils/ApiResponse";
import UserModel from "../models/User.model";
import MarketModel from "../models/Market.model";


class BetController {
    /**
     * Place a bet on a market
     */
    static placeBet = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log("req.body", req.body)
            const { marketId } = req.body;
            const amount = Number(req.body.amount);
            const number = Number(req.body.number);


            const userId = req.user?._id;

            // Validate input
            if (!marketId || !number || !amount) {
                return ApiResponse.error(res, {
                    error: 'Validation Error',
                    message: 'Market, number, and amount are required.',
                    statusCode: 400
                });
            }

            if (amount < 20) {
                return ApiResponse.error(res, {
                    error: 'Validation Error',
                    message: 'Minimum bet amount is 20.',
                    statusCode: 400
                });
            }


            if (!Number.isInteger(number) || number < 0 || number > 100) {
                return ApiResponse.error(res, {
                    error: 'Validation Error',
                    message: 'Number must be an integer between 0 and 100.',
                    statusCode: 400
                });
            }


            const user = await UserModel.findById(userId);

            if (!user) {
                return ApiResponse.error(res, {
                    error: 'Authentication Error',
                    message: 'User not authenticated.',
                    statusCode: 401
                });
            }

            if (user.balance < amount) {
                return ApiResponse.success(res, {
                    data: 'Insufficient Balance',
                    message: 'You do not have enough balance to place this bet.',
                    statusCode: 301
                });
            }

            console.log(" user balance before placing bet ", user.balance);
            user.balance -= amount;
            await user.save();


            console.log(" user balance after placing bet ", user.balance);
            const userBalance = user.balance;
            console.log(" user balance  ", userBalance);



            // Create the bet
            const bet = await BetModel.create({
                user: userId,
                number,
                amount,
                marketId,
                bet_placed_at: Date.now(),
                status: 'pending'
            });

            if (!bet) {
                return ApiResponse.error(res, {
                    error: 'Bet Creation Error',
                    message: 'Failed to create bet.',
                    statusCode: 500
                });
            }

            // Log the bet creation
            console.log(`Bet created successfully: ${bet._id} for user: ${userId}`);

            // Update user's bet history
            if (user) {
                if (!user.bet_history) {
                    user.bet_history = [];
                }
                user.bet_history.push(bet._id);
                await user.save();
            } else {
                return ApiResponse.error(res, {
                    error: 'Authentication Error',
                    message: 'User not authenticated.',
                    statusCode: 401
                });
            }


            return ApiResponse.success(res, {
                message: "Bet placed successfully",
                data: {
                    userBalance
                },
                statusCode: 201
            });
        } catch (error) {
            next(error);
        }
    };



    /**
     * Get all bets for a user
     */
    static getUserBets = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id;

            if (!userId) {
                return ApiResponse.error(res, {
                    error: 'Authentication Error',
                    message: 'User not authenticated.',
                    statusCode: 401
                });
            }

            const bets = await BetModel.find({ user: userId })
                .populate('user', 'username email')
                .populate('marketId');

           


            if (!bets || bets.length === 0) {
                return ApiResponse.success(res, {
                    message: "No bets found for this user.",
                    data: [],
                    statusCode: 200
                });
            }

            return ApiResponse.success(res, {
                message: "Bets retrieved successfully",
                data: bets,
                statusCode: 200
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all bets for a specific market
     */
    static getMarketBets = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { market } = req.params;

            if (!market) {
                return ApiResponse.error(res, {
                    error: 'Validation Error',
                    message: 'Market is required.',
                    statusCode: 400
                });
            }

            const bets = await BetModel.find({ market }).populate('user', 'username email');

            if (!bets || bets.length === 0) {
                return ApiResponse.success(res, {
                    message: "No bets found for this market.",
                    data: [],
                    statusCode: 200
                });
            }

            return ApiResponse.success(res, {
                message: "Bets retrieved successfully",
                data: bets,
                statusCode: 200
            });
        } catch (error) {
            next(error);
        }
    }



    /**
     * Get all bets for a specific date
     */
    static getDateBets = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { date } = req.params;

            if (!date) {
                return ApiResponse.error(res, {
                    error: 'Validation Error',
                    message: 'Date is required.',
                    statusCode: 400
                });
            }

            const bets = await BetModel.find({ bet_time: { $gte: new Date(date), $lt: new Date(date + 'T23:59:59') } }).populate('user', 'username email');

            if (!bets || bets.length === 0) {
                return ApiResponse.success(res, {
                    message: "No bets found for this date.",
                    data: [],
                    statusCode: 200
                });
            }

            return ApiResponse.success(res, {
                message: "Bets retrieved successfully",
                data: bets,
                statusCode: 200
            });
        } catch (error) {
            next(error);
        }
    }


};


export default BetController;