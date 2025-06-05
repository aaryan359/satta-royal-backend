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
const mongoose_1 = __importDefault(require("mongoose"));
const Transaction_model_1 = __importDefault(require("../models/Transaction.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
function canWithdraw(user, amount) {
    const balanceLeft = user.balance - amount;
    return balanceLeft >= user.bonusBalance;
}
class TransactionController {
}
_a = TransactionController;
/**
 * Deposit money to user account
 */
TransactionController.depositMoney = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    // for atomic transaction
    const session = yield mongoose_1.default.startSession();
    try {
        yield session.startTransaction();
        const { amount, paymentMethod, paymentGatewayRef, paymentDetails } = req.body;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
        console.log("user data in the backend is", amount, paymentMethod, paymentGatewayRef, paymentDetails);
        // Validate input
        if (!amount || amount <= 0) {
            return ApiResponse_1.default.error(res, {
                error: 'Validation Error',
                message: 'Amount must be greater than 0',
                statusCode: 400,
            });
        }
        if (!paymentMethod) {
            return ApiResponse_1.default.error(res, {
                error: 'Validation Error',
                message: 'Payment method is required',
                statusCode: 400,
            });
        }
        // Find user
        const user = yield User_model_1.default.findById(userId).session(session);
        if (!user) {
            yield session.abortTransaction();
            return ApiResponse_1.default.error(res, {
                error: 'Not Found',
                message: 'User not found',
                statusCode: 404,
            });
        }
        // Check if user is active and not suspended
        if (!user.isActive || user.isSuspended) {
            yield session.abortTransaction();
            return ApiResponse_1.default.error(res, {
                error: 'Account Error',
                message: 'Account is inactive or suspended',
                statusCode: 403,
            });
        }
        // Check daily deposit limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayDeposits = yield Transaction_model_1.default.aggregate([
            {
                $match: {
                    user: new mongoose_1.default.Types.ObjectId(userId),
                    type: 'deposit',
                    status: { $in: ['completed', 'processing'] },
                    createdAt: { $gte: today }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]).session(session);
        const todayDepositAmount = ((_c = todayDeposits[0]) === null || _c === void 0 ? void 0 : _c.totalAmount) || 0;
        if (todayDepositAmount + amount > user.dailyDepositLimit) {
            yield session.abortTransaction();
            return ApiResponse_1.default.error(res, {
                error: 'Limit Exceeded',
                message: `Daily deposit limit of ₹${user.dailyDepositLimit} exceeded`,
                statusCode: 400,
            });
        }
        // Create transaction record
        const transaction = new Transaction_model_1.default({
            user: userId,
            type: 'deposit',
            amount: amount,
            balanceBefore: user.balance,
            balanceAfter: user.balance + amount,
            paymentMethod: paymentMethod,
            paymentGatewayRef: paymentGatewayRef,
            paymentDetails: paymentDetails,
            status: 'processing', // Will be updated by payment gateway webhook
            description: `Deposit via ${paymentMethod}`,
            ipAddress: req.ip,
            deviceInfo: {
                userAgent: req.get('User-Agent'),
                deviceType: ((_d = req.get('User-Agent')) === null || _d === void 0 ? void 0 : _d.includes('Mobile')) ? 'mobile' : 'desktop'
            },
            processedAt: new Date()
        });
        yield transaction.save({ session });
        //update the user amount
        user.balance += amount;
        // Add transaction to user's transaction history
        user.transactions.push(transaction._id);
        console.log(" user balance is updayed", user.balance);
        yield user.save({ session });
        const userBalance = user.balance;
        yield session.commitTransaction();
        console.log(" user balance is updayed", user.balance);
        console.log("transaction is completed", transaction);
        return ApiResponse_1.default.success(res, {
            data: {
                userBalance
            },
            message: 'Deposit request created successfully. Please complete the payment.',
            statusCode: 201,
        });
    }
    catch (error) {
        yield session.abortTransaction();
        console.error('Deposit Error:', error);
        return ApiResponse_1.default.error(res, {
            error: 'Database Error',
            message: error.message,
            statusCode: 500,
        });
    }
    finally {
        session.endSession();
    }
});
TransactionController.depositBonus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const session = yield mongoose_1.default.startSession();
    try {
        yield session.startTransaction();
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
        // Find user
        const user = yield User_model_1.default.findById(userId).session(session);
        if (!user) {
            yield session.abortTransaction();
            return ApiResponse_1.default.error(res, {
                error: 'Not Found',
                message: 'User not found',
                statusCode: 404,
            });
        }
        // Check if user is active and not suspended
        if (!user.isActive || user.isSuspended) {
            yield session.abortTransaction();
            return ApiResponse_1.default.error(res, {
                error: 'Account Error',
                message: 'Account is inactive or suspended',
                statusCode: 403,
            });
        }
        const amount = 100;
        // Create transaction record
        const transaction = new Transaction_model_1.default({
            user: userId,
            type: 'bonus',
            amount: amount,
            balanceBefore: user.balance,
            balanceAfter: user.balance + amount,
            paymentMethod: 'cashfree',
            paymentGatewayRef: "no needed",
            paymentDetails: "bonus by admin",
            status: 'completed',
            description: `Deposit via amdin for bonus`,
            processedAt: new Date()
        });
        yield transaction.save({ session });
        //update the user amount
        user.balance += amount;
        // Add transaction to user's transaction history
        user.transactions.push(transaction._id);
        console.log(" user balance is updayed", user.balance);
        yield user.save({ session });
        const userBalance = user.balance;
        yield session.commitTransaction();
        console.log(" user balance is updayed", user.balance);
        console.log("transaction is completed", transaction);
        return ApiResponse_1.default.success(res, {
            data: {
                userBalance
            },
            message: 'Deposit request created successfully. Please complete the payment.',
            statusCode: 201,
        });
    }
    catch (error) {
        yield session.abortTransaction();
        console.error('Deposit Error:', error);
        return ApiResponse_1.default.error(res, {
            error: 'Database Error',
            message: error.message,
            statusCode: 500,
        });
    }
    finally {
        session.endSession();
    }
});
/**
 * Withdraw money from user account
 */
TransactionController.withdrawMoney = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e;
    const session = yield mongoose_1.default.startSession();
    try {
        yield session.startTransaction();
        const { amount, paymentMethod, paymentDetails } = req.body;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
        // Validate input
        if (!amount || amount <= 0) {
            return ApiResponse_1.default.error(res, {
                error: 'Validation Error',
                message: 'Amount must be greater than 0',
                statusCode: 400,
            });
        }
        if (!paymentMethod || !paymentDetails) {
            return ApiResponse_1.default.error(res, {
                error: 'Validation Error',
                message: 'Payment method and details are required',
                statusCode: 400,
            });
        }
        // Find user
        const user = yield User_model_1.default.findById(userId).session(session);
        if (!user) {
            yield session.abortTransaction();
            return ApiResponse_1.default.error(res, {
                error: 'Not Found',
                message: 'User not found',
                statusCode: 404,
            });
        }
        // Check if user is active, verified, and not suspended
        if (!user.isActive || user.isSuspended) {
            yield session.abortTransaction();
            return ApiResponse_1.default.error(res, {
                error: 'Account Error',
                message: 'Account is inactive or suspended',
                statusCode: 403,
            });
        }
        // Check daily withdrawal limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayWithdrawals = yield Transaction_model_1.default.aggregate([
            {
                $match: {
                    user: new mongoose_1.default.Types.ObjectId(userId),
                    type: 'withdrawal',
                    status: { $in: ['completed', 'processing', 'pending'] },
                    createdAt: { $gte: today }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]).session(session);
        const todayWithdrawalAmount = ((_c = todayWithdrawals[0]) === null || _c === void 0 ? void 0 : _c.totalAmount) || 0;
        if (todayWithdrawalAmount + amount > user.dailyWithdrawalLimit) {
            yield session.abortTransaction();
            return ApiResponse_1.default.error(res, {
                error: 'Limit Exceeded',
                message: `Daily withdrawal limit of ₹${user.dailyWithdrawalLimit} exceeded`,
                statusCode: 400,
            });
        }
        if (!canWithdraw(user, todayWithdrawalAmount)) {
            return res.status(400).json({ error: "You cannot withdraw bonus amount" });
        }
        // Calculate withdrawal fee (2% or minimum ₹10)
        const feePercent = 0.02; // 2%
        const minimumFee = 10;
        const calculatedFee = Math.max(amount * feePercent, minimumFee);
        const fee = Math.min(calculatedFee, 100);
        // Check if user has sufficient balance
        const requiredAmount = amount;
        if (((_d = user.availableBalance) !== null && _d !== void 0 ? _d : 0) < requiredAmount) {
            yield session.abortTransaction();
            return ApiResponse_1.default.error(res, {
                error: 'Insufficient Balance',
                message: 'Insufficient balance for withdrawal',
                statusCode: 400,
            });
        }
        // Lock the withdrawal amount
        user.lockedBalance += requiredAmount;
        user.balance -= requiredAmount;
        // Create transaction record
        const transaction = new Transaction_model_1.default({
            user: userId,
            type: 'withdrawal',
            amount: amount,
            fee: fee,
            netAmount: amount - fee,
            balanceBefore: user.balance + requiredAmount,
            balanceAfter: user.balance,
            paymentMethod: paymentMethod,
            paymentDetails: paymentDetails,
            status: 'pending',
            description: `Withdrawal via ${paymentMethod}`,
            ipAddress: req.ip,
            deviceInfo: {
                userAgent: req.get('User-Agent'),
                deviceType: ((_e = req.get('User-Agent')) === null || _e === void 0 ? void 0 : _e.includes('Mobile')) ? 'mobile' : 'desktop'
            }
        });
        yield transaction.save({ session });
        // Add transaction to user's transaction history
        user.transactions.push(transaction._id);
        yield user.save({ session });
        yield session.commitTransaction();
        return ApiResponse_1.default.success(res, {
            data: {
                transactionId: transaction._id,
                amount: transaction.amount,
                fee: transaction.fee,
                netAmount: transaction.netAmount,
                status: transaction.status,
                paymentMethod: transaction.paymentMethod,
                createdAt: transaction.createdAt
            },
            message: 'Withdrawal request submitted successfully. It will be processed within 24 hours.',
            statusCode: 201,
        });
    }
    catch (error) {
        yield session.abortTransaction();
        console.error('Withdrawal Error:', error);
        return ApiResponse_1.default.error(res, {
            error: 'Database Error',
            message: error.message,
            statusCode: 500,
        });
    }
    finally {
        session.endSession();
    }
});
/**
 * Get recent transactions for the user
 */
TransactionController.getRecentTransactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
        const { page = 1, limit = 20, type, status } = req.query;
        // Build query
        const query = { user: userId };
        if (type)
            query.type = type;
        if (status)
            query.status = status;
        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Get transactions with pagination
        const [transactions, total] = yield Promise.all([
            Transaction_model_1.default.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .select('-paymentDetails -adminNotes -deviceInfo -ipAddress')
                .lean(),
            Transaction_model_1.default.countDocuments(query)
        ]);
        // Calculate summary
        const summary = yield Transaction_model_1.default.aggregate([
            { $match: { user: new mongoose_1.default.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$type',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);
        const summaryData = {
            totalDeposits: ((_c = summary.find(s => s._id === 'deposit')) === null || _c === void 0 ? void 0 : _c.totalAmount) || 0,
            totalWithdrawals: ((_d = summary.find(s => s._id === 'withdrawal')) === null || _d === void 0 ? void 0 : _d.totalAmount) || 0,
            totalTransactions: summary.reduce((acc, s) => acc + s.count, 0)
        };
        return ApiResponse_1.default.success(res, {
            data: {
                transactions,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalRecords: total,
                    hasNext: pageNum < Math.ceil(total / limitNum),
                    hasPrev: pageNum > 1
                },
                summary: summaryData
            },
            message: 'Transactions retrieved successfully',
            statusCode: 200,
        });
    }
    catch (error) {
        console.error('Get Transactions Error:', error);
        return ApiResponse_1.default.error(res, {
            error: 'Database Error',
            message: error.message,
            statusCode: 500,
        });
    }
});
/**
 * Get single transaction details
 */
TransactionController.getTransactionDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { transactionId } = req.params;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
        // Validate transaction ID
        if (!mongoose_1.default.Types.ObjectId.isValid(transactionId)) {
            return ApiResponse_1.default.error(res, {
                error: 'Validation Error',
                message: 'Invalid transaction ID',
                statusCode: 400,
            });
        }
        // Find transaction
        const transaction = yield Transaction_model_1.default.findOne({
            _id: transactionId,
            user: userId
        }).select('-adminNotes -deviceInfo -ipAddress');
        if (!transaction) {
            return ApiResponse_1.default.error(res, {
                error: 'Not Found',
                message: 'Transaction not found',
                statusCode: 404,
            });
        }
        return ApiResponse_1.default.success(res, {
            data: transaction,
            message: 'Transaction details retrieved successfully',
            statusCode: 200,
        });
    }
    catch (error) {
        console.error('Get Transaction Details Error:', error);
        return ApiResponse_1.default.error(res, {
            error: 'Database Error',
            message: error.message,
            statusCode: 500,
        });
    }
});
/**
   * get all the transactions
   */
TransactionController.getAllTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
});
/**
 * Cancel pending transaction
 */
TransactionController.cancelTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const session = yield mongoose_1.default.startSession();
    try {
        yield session.startTransaction();
        const { transactionId } = req.params;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
        // Find transaction
        const transaction = yield Transaction_model_1.default.findOne({
            _id: transactionId,
            user: userId,
            status: 'pending'
        }).session(session);
        if (!transaction) {
            yield session.abortTransaction();
            return ApiResponse_1.default.error(res, {
                error: 'Not Found',
                message: 'Pending transaction not found',
                statusCode: 404,
            });
        }
        // Only allow cancellation of pending withdrawals
        if (transaction.type !== 'withdrawal') {
            yield session.abortTransaction();
            return ApiResponse_1.default.error(res, {
                error: 'Invalid Operation',
                message: 'Only pending withdrawals can be cancelled',
                statusCode: 400,
            });
        }
        // Update transaction status
        transaction.status = 'cancelled';
        transaction.failureReason = 'Cancelled by user';
        yield transaction.save({ session });
        // Release locked balance
        const user = yield User_model_1.default.findById(userId).session(session);
        if (user) {
            user.balance += transaction.amount;
            user.lockedBalance -= transaction.amount;
            yield user.save({ session });
        }
        yield session.commitTransaction();
        return ApiResponse_1.default.success(res, {
            data: {
                transactionId: transaction._id,
                status: transaction.status
            },
            message: 'Transaction cancelled successfully',
            statusCode: 200,
        });
    }
    catch (error) {
        yield session.abortTransaction();
        console.error('Cancel Transaction Error:', error);
        return ApiResponse_1.default.error(res, {
            error: 'Database Error',
            message: error.message,
            statusCode: 500,
        });
    }
    finally {
        session.endSession();
    }
});
exports.default = TransactionController;
