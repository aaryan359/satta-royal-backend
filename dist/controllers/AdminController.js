"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const Market_model_1 = __importDefault(require("../models/Market.model"));
const moment_1 = __importDefault(require("moment"));
const Transaction_model_1 = __importDefault(require("../models/Transaction.model"));
const Bet_model_1 = __importDefault(require("../models/Bet.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
class AdminController {
}
_a = AdminController;
/**
 * update the result of a market
 */
AdminController.updateMarketResult = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { marketid } = req.params;
    const { result } = req.body;
    try {
        // 1. Find and update market
        const market = yield Market_model_1.default.findById(marketid);
        if (!market) {
            return ApiResponse_1.default.error(res, {
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
        const pendingBets = yield Bet_model_1.default.find({
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
                yield bet.save();
                // Update user balance
                const user = yield User_model_1.default.findById(bet.user);
                if (user) {
                    user.balance += payoutAmount;
                    yield user.save();
                }
            }
            else {
                // Losing bet
                bet.status = 'lost';
                bet.payout = 0;
                yield bet.save();
            }
        }
        // 4. Save market updates after processing all bets
        const updatedMarket = yield market.save();
        return ApiResponse_1.default.success(res, {
            data: {
                market: updatedMarket,
                processedBets: pendingBets.length,
            },
            message: 'Market result declared and bets processed',
            statusCode: 200,
        });
    }
    catch (error) {
        return ApiResponse_1.default.error(res, {
            message: error.message || 'Failed to declare market result',
            statusCode: 500,
        });
    }
});
/**
 * add new market
 */
AdminController.addMarket = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, active_hours, code } = req.body;
        console.log('req body is', req.body);
        // Validate input presence
        if (!name || !active_hours || !code) {
            return ApiResponse_1.default.error(res, {
                error: 'Validation Error',
                message: 'All fields (name, active_hours, code) are required.',
                statusCode: 400,
            });
        }
        const { open, close } = active_hours;
        // Validate time format HH:mm (24-hour)
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(open) || !timeRegex.test(close)) {
            return ApiResponse_1.default.error(res, {
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
            return ApiResponse_1.default.error(res, {
                error: 'Validation Error',
                message: 'Closing time must be after opening time.',
                statusCode: 400,
            });
        }
        // Calculate odds: 950 payout for 10 bet => 950 / 10 = 95
        const odds = 95;
        const newMarket = new Market_model_1.default({
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
        yield newMarket.save();
        return ApiResponse_1.default.success(res, {
            data: newMarket,
            message: 'Market created successfully',
            statusCode: 201,
        });
    }
    catch (error) {
        return ApiResponse_1.default.error(res, {
            error: 'Database Error',
            message: error.message,
        });
    }
});
/**
 * update market status open or closed
 *
 */
AdminController.updateStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { marketid } = req.params;
    const { status } = req.body;
    try {
        const market = yield Market_model_1.default.findById(marketid);
        if (market) {
            market.status = status;
        }
        const updatedMarket = yield market.save();
        return ApiResponse_1.default.success(res, {
            data: updatedMarket,
            message: 'updated status sussesfully',
            statusCode: 201,
        });
    }
    catch (error) {
        return ApiResponse_1.default.error(res, {
            message: error.message,
        });
    }
});
/**
 * update market
 */
AdminController.updateMarket = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { marketid } = req.params;
    const marketData = req.body;
    try {
        const market = yield Market_model_1.default.findById(marketid);
        if (!market) {
            return ApiResponse_1.default.error(res, {
                message: 'Market not found',
                statusCode: 404,
            });
        }
        Object.assign(market, marketData);
        const updatedMarket = yield market.save();
        return ApiResponse_1.default.success(res, {
            data: updatedMarket,
            message: 'Market updated successfully',
            statusCode: 200,
        });
    }
    catch (error) {
        return ApiResponse_1.default.error(res, {
            message: error.message ||
                'An error occurred while updating the market',
            statusCode: 500,
        });
    }
});
/**
 * delete market
 */
AdminController.deleteMarket = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { marketid } = req.params;
    try {
        const deletedMarket = yield Market_model_1.default.findByIdAndDelete(marketid);
        if (!deletedMarket) {
            return ApiResponse_1.default.error(res, {
                message: 'Market not found',
                statusCode: 404,
            });
        }
        return ApiResponse_1.default.success(res, {
            message: 'Market deleted successfully',
            data: deletedMarket,
            statusCode: 200,
        });
    }
    catch (error) {
        return ApiResponse_1.default.error(res, {
            message: error.message || 'Failed to delete market',
            statusCode: 500,
        });
    }
});
/**
 * get all the market
 */
AdminController.getMarket = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const markets = yield Market_model_1.default.find({});
        if (markets) {
            return ApiResponse_1.default.success(res, {
                data: markets,
                statusCode: 201,
                message: 'Market reterive sussesfully',
            });
        }
    }
    catch (error) {
        return ApiResponse_1.default.error(res, {
            message: error.message,
        });
    }
});
/**
 *  find user with particular transaction
 */
AdminController.findUser = () => __awaiter(void 0, void 0, void 0, function* () { });
AdminController.getTodayResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { marketid } = req.params;
    try {
        const market = yield Market_model_1.default.findById(marketid);
        if (!market) {
            return ApiResponse_1.default.error(res, {
                message: 'Market not found',
            });
        }
        const today = (0, moment_1.default)().startOf('day');
        const todayResult = market.result_history.find((entry) => (0, moment_1.default)(entry.declared_at).isSame(today, 'day'));
        if (!todayResult) {
            return ApiResponse_1.default.success(res, {
                data: null,
                message: 'No result declared today',
            });
        }
        return ApiResponse_1.default.success(res, {
            data: todayResult,
            message: "Today's result fetched successfully",
        });
    }
    catch (error) {
        return ApiResponse_1.default.error(res, {
            message: error.message || "Failed to get today's result",
        });
    }
});
AdminController.getAllResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { marketid } = req.params;
    try {
        const market = yield Market_model_1.default.findById(marketid);
        if (!market) {
            return ApiResponse_1.default.error(res, {
                message: 'Market not found',
            });
        }
        return ApiResponse_1.default.success(res, {
            data: market.result_history,
            message: 'All results fetched successfully',
        });
    }
    catch (error) {
        return ApiResponse_1.default.error(res, {
            message: error.message || 'Failed to get results',
        });
    }
});
AdminController.getAllTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactions = yield Transaction_model_1.default.find().populate('user');
        console.log('transactions ');
        return ApiResponse_1.default.success(res, {
            data: transactions,
            message: 'sussesfully getTransactions',
            statusCode: 201,
        });
    }
    catch (error) {
        ApiResponse_1.default.error(res, {
            error: error.message,
        });
    }
});
AdminController.approvedTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { transactionId } = req.params;
    const { status } = req.body;
    try {
        const transaction = yield Transaction_model_1.default.findById(transactionId);
        if (!transaction) {
            return ApiResponse_1.default.error(res, {
                message: 'Transaction not found.',
                statusCode: 404,
            });
        }
        const now = new Date();
        transaction.status = status;
        transaction.processedAt = transaction.processedAt || now;
        transaction.completedAt = now;
        transaction.updatedAt = now;
        yield transaction.save();
        return ApiResponse_1.default.success(res, {
            data: transaction,
            message: 'Approved sussessfull',
            statusCode: 201,
        });
    }
    catch (error) {
        return ApiResponse_1.default.error(res, {
            error: error.message,
            message: 'transactions approval failed',
            statusCode: 500,
        });
    }
});
AdminController.getUserAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get date range for analytics (default: last 30 days)
        const { days = 30 } = req.query;
        const dateRange = new Date();
        dateRange.setDate(dateRange.getDate() - Number(days));
        // Get all users with their basic info
        const users = yield User_model_1.default.find({})
            .select('_id username createdAt lastLogin balance')
            .lean();
        if (!users.length) {
            return ApiResponse_1.default.success(res, {
                data: [],
                message: 'Successfully retrieved user analytics',
                statusCode: 200,
            });
        }
        // Get all bets for these users within date range
        const userBets = yield Bet_model_1.default.aggregate([
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
        const userTransactions = yield Transaction_model_1.default.aggregate([
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
        const prevUserBets = yield Bet_model_1.default.aggregate([
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
        const betsMap = new Map(userBets.map((bet) => [bet._id.toString(), bet]));
        const transactionsMap = new Map(userTransactions.map((tx) => [tx._id.toString(), tx]));
        const prevBetsMap = new Map(prevUserBets.map((bet) => [bet._id.toString(), bet]));
        // Calculate analytics for each user
        const analytics = users.map((user) => {
            var _b;
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
            const winRate = betsData.totalBets > 0
                ? (betsData.wonBets / betsData.totalBets) * 100
                : 0;
            // Calculate net profit (total won - total bet + deposits - withdrawals)
            const netProfit = txData.totalBetCredits -
                txData.totalBetDebits +
                (txData.totalDeposits - txData.totalWithdrawals);
            // Calculate average bet amount
            const averageBetAmount = betsData.totalBets > 0
                ? betsData.totalAmountBet / betsData.totalBets
                : 0;
            // Calculate trend (percentage change from previous period)
            let trend = 0;
            if (prevBetsData.totalAmountBet > 0) {
                const currentProfit = betsData.totalAmountWon - betsData.totalAmountBet;
                const prevProfit = prevBetsData.totalAmountWon -
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
                averageBetAmount: parseFloat(averageBetAmount.toFixed(2)),
                trend: parseFloat(trend.toFixed(2)),
                lastActivity: ((_b = user.lastLogin) === null || _b === void 0 ? void 0 : _b.toISOString()) ||
                    user.createdAt.toISOString(),
            };
        });
        return ApiResponse_1.default.success(res, {
            data: analytics,
            message: 'Successfully retrieved user analytics',
            statusCode: 200,
        });
    }
    catch (error) {
        console.error('Error fetching user analytics:', error);
        return ApiResponse_1.default.error(res, {
            error: error.message,
            message: 'Failed to fetch user analytics',
            statusCode: 500,
        });
    }
});
exports.default = AdminController;
