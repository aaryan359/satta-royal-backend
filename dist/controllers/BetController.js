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
const Bet_model_1 = __importDefault(require("../models/Bet.model"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const User_model_1 = __importDefault(require("../models/User.model"));
class BetController {
}
_a = BetController;
/**
 * Place a bet on a market
 */
BetController.placeBet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        console.log("req.body", req.body);
        const { marketId } = req.body;
        const amount = Number(req.body.amount);
        const number = Number(req.body.number);
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
        // Validate input
        if (!marketId || !number || !amount) {
            return ApiResponse_1.default.error(res, {
                error: 'Validation Error',
                message: 'Market, number, and amount are required.',
                statusCode: 400
            });
        }
        if (amount < 20) {
            return ApiResponse_1.default.error(res, {
                error: 'Validation Error',
                message: 'Minimum bet amount is 20.',
                statusCode: 400
            });
        }
        if (!Number.isInteger(number) || number < 0 || number > 100) {
            return ApiResponse_1.default.error(res, {
                error: 'Validation Error',
                message: 'Number must be an integer between 0 and 100.',
                statusCode: 400
            });
        }
        const user = yield User_model_1.default.findById(userId);
        if (!user) {
            return ApiResponse_1.default.error(res, {
                error: 'Authentication Error',
                message: 'User not authenticated.',
                statusCode: 401
            });
        }
        if (user.balance < amount) {
            return ApiResponse_1.default.success(res, {
                data: 'Insufficient Balance',
                message: 'You do not have enough balance to place this bet.',
                statusCode: 301
            });
        }
        console.log(" user balance before placing bet ", user.balance);
        user.balance -= amount;
        yield user.save();
        console.log(" user balance after placing bet ", user.balance);
        const userBalance = user.balance;
        console.log(" user balance  ", userBalance);
        // Create the bet
        const bet = yield Bet_model_1.default.create({
            user: userId,
            number,
            amount,
            marketId,
            bet_placed_at: Date.now(),
            status: 'pending'
        });
        if (!bet) {
            return ApiResponse_1.default.error(res, {
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
            yield user.save();
        }
        else {
            return ApiResponse_1.default.error(res, {
                error: 'Authentication Error',
                message: 'User not authenticated.',
                statusCode: 401
            });
        }
        return ApiResponse_1.default.success(res, {
            message: "Bet placed successfully",
            data: {
                userBalance
            },
            statusCode: 201
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * Get all bets for a user
 */
BetController.getUserBets = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
        if (!userId) {
            return ApiResponse_1.default.error(res, {
                error: 'Authentication Error',
                message: 'User not authenticated.',
                statusCode: 401
            });
        }
        const bets = yield Bet_model_1.default.find({ user: userId })
            .populate('user', 'username email')
            .populate('marketId');
        if (!bets || bets.length === 0) {
            return ApiResponse_1.default.success(res, {
                message: "No bets found for this user.",
                data: [],
                statusCode: 200
            });
        }
        return ApiResponse_1.default.success(res, {
            message: "Bets retrieved successfully",
            data: bets,
            statusCode: 200
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * Get all bets for a specific market
 */
BetController.getMarketBets = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { market } = req.params;
        if (!market) {
            return ApiResponse_1.default.error(res, {
                error: 'Validation Error',
                message: 'Market is required.',
                statusCode: 400
            });
        }
        const bets = yield Bet_model_1.default.find({ market }).populate('user', 'username email');
        if (!bets || bets.length === 0) {
            return ApiResponse_1.default.success(res, {
                message: "No bets found for this market.",
                data: [],
                statusCode: 200
            });
        }
        return ApiResponse_1.default.success(res, {
            message: "Bets retrieved successfully",
            data: bets,
            statusCode: 200
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * Get all bets for a specific date
 */
BetController.getDateBets = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date } = req.params;
        if (!date) {
            return ApiResponse_1.default.error(res, {
                error: 'Validation Error',
                message: 'Date is required.',
                statusCode: 400
            });
        }
        const bets = yield Bet_model_1.default.find({ bet_time: { $gte: new Date(date), $lt: new Date(date + 'T23:59:59') } }).populate('user', 'username email');
        if (!bets || bets.length === 0) {
            return ApiResponse_1.default.success(res, {
                message: "No bets found for this date.",
                data: [],
                statusCode: 200
            });
        }
        return ApiResponse_1.default.success(res, {
            message: "Bets retrieved successfully",
            data: bets,
            statusCode: 200
        });
    }
    catch (error) {
        next(error);
    }
});
;
exports.default = BetController;
