import { Request, Response, NextFunction } from 'express';
import ApiResponse from '../utils/ApiResponse';
import MarketModel from '../models/Market.model';
import moment from 'moment';
import TransactionModel from '../models/Transaction.model';
import BetModel from '../models/Bet.model';
import UserModel from '../models/User.model';

interface UserAnalytics {
     userId: string;
     username: string;
     totalBets: number;
     wonBets: number;
     lostBets: number;
     winRate: number;
     totalAmountBet: number;
     totalAmountWon: number;
     netProfit: number;
     averageBetAmount: number;
     trend: number;
     lastActivity: string;
}

class AdminController {
     /**
      * update the result of a market
      */
     static updateMarketResult = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => {
          const { marketid } = req.params;
          const { result } = req.body;

          try {
               // 1. Find and update market
               const market = await MarketModel.findById(marketid);
               if (!market) {
                    return ApiResponse.error(res, {
                         message: 'Market not found',
                         statusCode: 404,
                    });
               }

               const now = new Date();

               // Update market result history
               market.result_history.push({
                    result,
                    declared_at: now,
               });

               // Update current market state
               market.current_winning_value = result;
               market.result_declared_at = now;
               market.status = 'result_declared';
               market.updatedAt = now;

               // 2. Find all pending bets for this market
               const pendingBets = await BetModel.find({
                    marketId: marketid,
                    status: 'pending',
               }).populate('user');

               // 3. Process each bet
               for (const bet of pendingBets) {
                    if (bet.number === result) {
                         // Winning bet
                         const payoutAmount = bet.amount * market.odds;

                         // Update bet status and payout
                         bet.status = 'won';
                         bet.payout = payoutAmount;
                         await bet.save();

                         // Update user balance
                         const user = await UserModel.findById(bet.user);
                         if (user) {
                              user.balance += payoutAmount;
                              await user.save();
                         }
                    } else {
                         // Losing bet
                         bet.status = 'lost';
                         bet.payout = 0;
                         await bet.save();
                    }
               }

               // 4. Save market updates after processing all bets
               const updatedMarket = await market.save();

               return ApiResponse.success(res, {
                    data: {
                         market: updatedMarket,
                         processedBets: pendingBets.length,
                    },
                    message: 'Market result declared and bets processed',
                    statusCode: 200,
               });
          } catch (error: any) {
               return ApiResponse.error(res, {
                    message: error.message || 'Failed to declare market result',
                    statusCode: 500,
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
                         open, // store as string "HH:mm"
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
      * update market status open or closed
      *
      */
     static updateStatus = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => {
          const { marketid } = req.params;
          const { status } = req.body;

          try {
               const market = await MarketModel.findById(marketid);

               if (market) {
                    market.status = status;
               }

               const updatedMarket = await market.save();

               return ApiResponse.success(res, {
                    data: updatedMarket,
                    message: 'updated status sussesfully',
                    statusCode: 201,
               });
          } catch (error: any) {
               return ApiResponse.error(res, {
                    message: error.message,
               });
          }
     };

     /**
      * update market
      */
     static updateMarket = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => {
          const { marketid } = req.params;
          const marketData = req.body;

          try {
               const market = await MarketModel.findById(marketid);

               if (!market) {
                    return ApiResponse.error(res, {
                         message: 'Market not found',
                         statusCode: 404,
                    });
               }

               Object.assign(market, marketData);

               const updatedMarket = await market.save();

               return ApiResponse.success(res, {
                    data: updatedMarket,
                    message: 'Market updated successfully',
                    statusCode: 200,
               });
          } catch (error: any) {
               return ApiResponse.error(res, {
                    message:
                         error.message ||
                         'An error occurred while updating the market',
                    statusCode: 500,
               });
          }
     };

     /**
      * delete market
      */
     static deleteMarket = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => {
          const { marketid } = req.params;

          try {
               const deletedMarket =
                    await MarketModel.findByIdAndDelete(marketid);

               if (!deletedMarket) {
                    return ApiResponse.error(res, {
                         message: 'Market not found',
                         statusCode: 404,
                    });
               }

               return ApiResponse.success(res, {
                    message: 'Market deleted successfully',
                    data: deletedMarket,
                    statusCode: 200,
               });
          } catch (error: any) {
               return ApiResponse.error(res, {
                    message: error.message || 'Failed to delete market',
                    statusCode: 500,
               });
          }
     };

     /**
      * get all the market
      */
     static getMarket = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => {
          try {
               const markets = await MarketModel.find({});

               if (markets) {
                    return ApiResponse.success(res, {
                         data: markets,
                         statusCode: 201,
                         message: 'Market reterive sussesfully',
                    });
               }
          } catch (error: any) {
               return ApiResponse.error(res, {
                    message: error.message,
               });
          }
     };

     /**
      *  find user with particular transaction
      */
     static findUser = async () => {};

     static getTodayResult = async (req: Request, res: Response) => {
          const { marketid } = req.params;

          try {
               const market = await MarketModel.findById(marketid);

               if (!market) {
                    return ApiResponse.error(res, {
                         message: 'Market not found',
                    });
               }

               const today = moment().startOf('day');

               const todayResult = market.result_history.find((entry: any) =>
                    moment(entry.declared_at).isSame(today, 'day'),
               );

               if (!todayResult) {
                    return ApiResponse.success(res, {
                         data: null,
                         message: 'No result declared today',
                    });
               }

               return ApiResponse.success(res, {
                    data: todayResult,
                    message: "Today's result fetched successfully",
               });
          } catch (error: any) {
               return ApiResponse.error(res, {
                    message: error.message || "Failed to get today's result",
               });
          }
     };

     static getAllResults = async (req: Request, res: Response) => {
          const { marketid } = req.params;

          try {
               const market = await MarketModel.findById(marketid);

               if (!market) {
                    return ApiResponse.error(res, {
                         message: 'Market not found',
                    });
               }

               return ApiResponse.success(res, {
                    data: market.result_history,
                    message: 'All results fetched successfully',
               });
          } catch (error: any) {
               return ApiResponse.error(res, {
                    message: error.message || 'Failed to get results',
               });
          }
     };

     static getAllTransaction = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => {
          try {
               const transactions =
                    await TransactionModel.find().populate('user');
               console.log('transactions ');

               return ApiResponse.success(res, {
                    data: transactions,
                    message: 'sussesfully getTransactions',
                    statusCode: 201,
               });
          } catch (error: any) {
               ApiResponse.error(res, {
                    error: error.message,
               });
          }
     };

     static approvedTransaction = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => {
          const { transactionId } = req.params;
          const { status } = req.body;

          try {
               const transaction =
                    await TransactionModel.findById(transactionId);

               if (!transaction) {
                    return ApiResponse.error(res, {
                         message: 'Transaction not found.',
                         statusCode: 404,
                    });
               }

               const now = new Date();
               transaction.status = status;
               transaction.processedAt = transaction.processedAt || now;
               transaction.completedAt = now;
               transaction.updatedAt = now;

               await transaction.save();

               return ApiResponse.success(res, {
                    data: transaction,
                    message: 'Approved sussessfull',
                    statusCode: 201,
               });
          } catch (error: any) {
               return ApiResponse.error(res, {
                    error: error.message,
                    message: 'transactions approval failed',
                    statusCode: 500,
               });
          }
     };

     static getUserAnalytics = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => {
          try {
               // Get date range for analytics (default: last 30 days)
               const { days = 30 } = req.query;
               const dateRange = new Date();
               dateRange.setDate(dateRange.getDate() - Number(days));

               // Get all users with their basic info
               const users = await UserModel.find({})
                    .select('_id username createdAt lastLogin balance')
                    .lean();

               if (!users.length) {
                    return ApiResponse.success(res, {
                         data: [],
                         message: 'Successfully retrieved user analytics',
                         statusCode: 200,
                    });
               }

               // Get all bets for these users within date range
               const userBets = await BetModel.aggregate([
                    {
                         $match: {
                              user: { $in: users.map((u) => u._id) },
                              createdAt: { $gte: dateRange },
                         },
                    },
                    {
                         $group: {
                              _id: '$user',
                              totalBets: { $sum: 1 },
                              wonBets: {
                                   $sum: {
                                        $cond: [
                                             { $eq: ['$status', 'won'] },
                                             1,
                                             0,
                                        ],
                                   },
                              },
                              lostBets: {
                                   $sum: {
                                        $cond: [
                                             { $eq: ['$status', 'lost'] },
                                             1,
                                             0,
                                        ],
                                   },
                              },
                              totalAmountBet: { $sum: '$stake' },
                              totalAmountWon: {
                                   $sum: {
                                        $cond: [
                                             { $eq: ['$status', 'won'] },
                                             '$payout',
                                             0,
                                        ],
                                   },
                              },
                         },
                    },
               ]);

               // Get transaction data for net profit calculation
               const userTransactions = await TransactionModel.aggregate([
                    {
                         $match: {
                              user: { $in: users.map((u) => u._id) },
                              status: 'completed',
                              createdAt: { $gte: dateRange },
                         },
                    },
                    {
                         $group: {
                              _id: '$user',
                              totalDeposits: {
                                   $sum: {
                                        $cond: [
                                             { $eq: ['$type', 'deposit'] },
                                             '$amount',
                                             0,
                                        ],
                                   },
                              },
                              totalWithdrawals: {
                                   $sum: {
                                        $cond: [
                                             { $eq: ['$type', 'withdrawal'] },
                                             '$netAmount',
                                             0,
                                        ],
                                   },
                              },
                              totalBetDebits: {
                                   $sum: {
                                        $cond: [
                                             { $eq: ['$type', 'bet_debit'] },
                                             '$amount',
                                             0,
                                        ],
                                   },
                              },
                              totalBetCredits: {
                                   $sum: {
                                        $cond: [
                                             { $eq: ['$type', 'bet_credit'] },
                                             '$amount',
                                             0,
                                        ],
                                   },
                              },
                         },
                    },
               ]);

               // Get previous period data for trend calculation
               const prevDateRange = new Date(dateRange);
               prevDateRange.setDate(prevDateRange.getDate() - Number(days));

               const prevUserBets = await BetModel.aggregate([
                    {
                         $match: {
                              user: { $in: users.map((u) => u._id) },
                              createdAt: {
                                   $gte: prevDateRange,
                                   $lt: dateRange,
                              },
                         },
                    },
                    {
                         $group: {
                              _id: '$user',
                              totalAmountBet: { $sum: '$stake' },
                              totalAmountWon: {
                                   $sum: {
                                        $cond: [
                                             { $eq: ['$status', 'won'] },
                                             '$payout',
                                             0,
                                        ],
                                   },
                              },
                         },
                    },
               ]);

               // Map data for efficient lookup
               const betsMap = new Map(
                    userBets.map((bet) => [bet._id.toString(), bet]),
               );
               const transactionsMap = new Map(
                    userTransactions.map((tx) => [tx._id.toString(), tx]),
               );
               const prevBetsMap = new Map(
                    prevUserBets.map((bet) => [bet._id.toString(), bet]),
               );

               // Calculate analytics for each user
               const analytics: UserAnalytics[] = users.map((user) => {
                    const userId = user._id.toString();
                    const betsData = betsMap.get(userId) || {
                         totalBets: 0,
                         wonBets: 0,
                         lostBets: 0,
                         totalAmountBet: 0,
                         totalAmountWon: 0,
                    };

                    const txData = transactionsMap.get(userId) || {
                         totalDeposits: 0,
                         totalWithdrawals: 0,
                         totalBetDebits: 0,
                         totalBetCredits: 0,
                    };

                    const prevBetsData = prevBetsMap.get(userId) || {
                         totalAmountBet: 0,
                         totalAmountWon: 0,
                    };

                    // Calculate win rate
                    const winRate =
                         betsData.totalBets > 0
                              ? (betsData.wonBets / betsData.totalBets) * 100
                              : 0;

                    // Calculate net profit (total won - total bet + deposits - withdrawals)
                    const netProfit =
                         txData.totalBetCredits -
                         txData.totalBetDebits +
                         (txData.totalDeposits - txData.totalWithdrawals);

                    // Calculate average bet amount
                    const averageBetAmount =
                         betsData.totalBets > 0
                              ? betsData.totalAmountBet / betsData.totalBets
                              : 0;

                    // Calculate trend (percentage change from previous period)
                    let trend = 0;
                    if (prevBetsData.totalAmountBet > 0) {
                         const currentProfit =
                              betsData.totalAmountWon - betsData.totalAmountBet;
                         const prevProfit =
                              prevBetsData.totalAmountWon -
                              prevBetsData.totalAmountBet;
                         trend =
                              ((currentProfit - prevProfit) /
                                   Math.abs(prevProfit)) *
                              100;
                    }

                    return {
                         userId: userId,
                         username: user.username,
                         totalBets: betsData.totalBets,
                         wonBets: betsData.wonBets,
                         lostBets: betsData.lostBets,
                         winRate: parseFloat(winRate.toFixed(2)),
                         totalAmountBet: betsData.totalAmountBet,
                         totalAmountWon: betsData.totalAmountWon,
                         netProfit: parseFloat(netProfit.toFixed(2)),
                         averageBetAmount: parseFloat(
                              averageBetAmount.toFixed(2),
                         ),
                         trend: parseFloat(trend.toFixed(2)),
                         lastActivity:
                              user.lastLogin?.toISOString() ||
                              user.createdAt.toISOString(),
                    };
               });

               return ApiResponse.success(res, {
                    data: analytics,
                    message: 'Successfully retrieved user analytics',
                    statusCode: 200,
               });
          } catch (error: any) {
               console.error('Error fetching user analytics:', error);
               return ApiResponse.error(res, {
                    error: error.message,
                    message: 'Failed to fetch user analytics',
                    statusCode: 500,
               });
          }
     };
}

export default AdminController;
