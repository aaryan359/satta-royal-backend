import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import TransactionModel from '../models/Transaction.model';
import UserModel from '../models/User.model';
import ApiResponse from '../utils/ApiResponse';

function canWithdraw(user: any, amount: any) {
     const balanceLeft = user.balance - amount;
     return balanceLeft >= user.bonusBalance;
}

function isValidUpiReferenceNumber(referenceNumber: string) {
     if (typeof referenceNumber !== 'string') {
          return false;
     }
     const regex = /^\d{12}$/;
     return regex.test(referenceNumber);
}

class TransactionController {
     /**
      * Deposit money to user account
      */
     static depositMoney = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => {
          // for atomic transaction
          const session = await mongoose.startSession();

          try {
               await session.startTransaction();

               
               const {
                    amount,
                    razorpay_payment_id
               } = req.body;


               const userId = req.user?._id;

               console.log(
                    'user data in the backend is',
                    amount,
                    razorpay_payment_id
               );

               // Validate input
               if (!amount || amount <= 10) {
                    return ApiResponse.error(res, {
                         error: 'Validation Error',
                         message: 'Amount must be greater than 10',
                         statusCode: 400,
                    });
               }




               // Find user
               const user = await UserModel.findById(userId).session(session);

               if (!user) {
                    await session.abortTransaction();
                    return ApiResponse.error(res, {
                         error: 'Not Found',
                         message: 'User not found',
                         statusCode: 404,
                    });
               }

               // Check if user is active and not suspended
               if (!user.isActive || user.isSuspended) {
                    await session.abortTransaction();
                    return ApiResponse.error(res, {
                         error: 'Account Error',
                         message: 'Account is inactive or suspended',
                         statusCode: 403,
                    });
               }

               // Check daily deposit limit
               const today = new Date();
               today.setHours(0, 0, 0, 0);

               const todayDeposits = await TransactionModel.aggregate([
                    {
                         $match: {
                              user: new mongoose.Types.ObjectId(userId),
                              type: 'deposit',
                              status: { $in: ['completed', 'processing'] },
                              createdAt: { $gte: today },
                         },
                    },
                    {
                         $group: {
                              _id: null,
                              totalAmount: { $sum: '$amount' },
                         },
                    },
               ]).session(session);

               const todayDepositAmount = todayDeposits[0]?.totalAmount || 0;

               if (todayDepositAmount + amount > user.dailyDepositLimit) {
                    await session.abortTransaction();
                    return ApiResponse.error(res, {
                         error: 'Limit Exceeded',
                         message: `Daily deposit limit of ₹${user.dailyDepositLimit} exceeded`,
                         statusCode: 400,
                    });
               }

               // Create transaction record
               const transaction = new TransactionModel({
                    user: userId,
                    type: 'deposit',
                    amount: amount,
                    balanceBefore: user.balance,
                    balanceAfter: user.balance + amount,
                    
                    razorPayPaymentId: razorpay_payment_id,
                    status: 'completed',
                    ipAddress: req.ip,
                    deviceInfo: {
                         userAgent: req.get('User-Agent'),
                         deviceType: req.get('User-Agent')?.includes('Mobile')
                              ? 'mobile'
                              : 'desktop',
                    },
                    processedAt: new Date(),
               });

               await transaction.save({ session });

               //update the user amount
               user.balance += amount;

               user.transactions.push(transaction._id);
               console.log(' user balance is updayed', user.balance);

               await user.save({ session });
               const userBalance = user.balance;
               await session.commitTransaction();
               console.log(' user balance is updayed', user.balance);
               console.log('transaction is completed', transaction);

               return ApiResponse.success(res, {
                    data: {
                         userBalance,
                    },
                    message: 'Deposit request created successfully. Please complete the payment.',
                    statusCode: 201,
               });
          } catch (error: any) {
               await session.abortTransaction();
               console.error('Deposit Error:', error);
               return ApiResponse.error(res, {
                    error: 'Database Error',
                    message: error.message,
                    statusCode: 500,
               });
          } finally {
               session.endSession();
          }
     };





     static depositBonus = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => {
          const session = await mongoose.startSession();

          try {
               await session.startTransaction();

               const userId = req.user?._id;

               // Find user
               const user = await UserModel.findById(userId).session(session);

               if (!user) {
                    await session.abortTransaction();
                    return ApiResponse.error(res, {
                         error: 'Not Found',
                         message: 'User not found',
                         statusCode: 404,
                    });
               }

               // Check if user is active and not suspended
               if (!user.isActive || user.isSuspended) {
                    await session.abortTransaction();
                    return ApiResponse.error(res, {
                         error: 'Account Error',
                         message: 'Account is inactive or suspended',
                         statusCode: 403,
                    });
               }

               const amount = 100;

               // Create transaction record
               const transaction = new TransactionModel({
                    user: userId,
                    type: 'bonus',
                    amount: amount,
                    balanceBefore: user.balance,
                    balanceAfter: user.balance + amount,
                    paymentMethod: 'cashfree',
                    paymentGatewayRef: 'no needed',
                    paymentDetails: 'bonus by admin',
                    status: 'completed',
                    description: `Deposit via amdin for bonus`,
                    processedAt: new Date(),
               });

               await transaction.save({ session });

               //update the user amount
               user.balance += amount;
               // Add transaction to user's transaction history
               user.transactions.push(transaction._id);
               console.log(' user balance is updayed', user.balance);

               await user.save({ session });
               const userBalance = user.balance;
               await session.commitTransaction();
               console.log(' user balance is updayed', user.balance);
               console.log('transaction is completed', transaction);

               return ApiResponse.success(res, {
                    data: {
                         userBalance,
                    },
                    message: 'Deposit request created successfully. Please complete the payment.',
                    statusCode: 201,
               });
          } catch (error: any) {
               await session.abortTransaction();
               console.error('Deposit Error:', error);
               return ApiResponse.error(res, {
                    error: 'Database Error',
                    message: error.message,
                    statusCode: 500,
               });
          } finally {
               session.endSession();
          }
     };




     /**
      * Withdraw money from user account
      */
     static withdrawMoney = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => {
          const session = await mongoose.startSession();

          try {
               await session.startTransaction();
               
               const { amount } = req.body;
               
               const userId = req.user?._id;

               // Validate input
               if (!amount || amount <= 0) {
                    return ApiResponse.error(res, {
                         error: 'Validation Error',
                         message: 'Amount must be greater than 0',
                         statusCode: 400,
                    });
               }

             
   

               // Find user
               const user = await UserModel.findById(userId).session(session);

               if (!user) {
                    await session.abortTransaction();
                    return ApiResponse.error(res, {
                         error: 'Not Found',
                         message: 'User not found',
                         statusCode: 404,
                    });
               }

               // Check if user is active, verified, and not suspended
               if (!user.isActive || user.isSuspended) {
                    await session.abortTransaction();
                    return ApiResponse.error(res, {
                         error: 'Account Error',
                         message: 'Account is inactive or suspended',
                         statusCode: 403,
                    });
               }

               // Check daily withdrawal limit
               const today = new Date();
               today.setHours(0, 0, 0, 0);
               const todayWithdrawals = await TransactionModel.aggregate([
                    {
                         $match: {
                              user: new mongoose.Types.ObjectId(userId),
                              type: 'withdrawal',
                              status: {
                                   $in: ['completed', 'processing', 'pending'],
                              },
                              createdAt: { $gte: today },
                         },
                    },
                    {
                         $group: {
                              _id: null,
                              totalAmount: { $sum: '$amount' },
                         },
                    },
               ]).session(session);

               const todayWithdrawalAmount = todayWithdrawals[0]?.totalAmount || 0;

               if (todayWithdrawalAmount + amount > user.dailyWithdrawalLimit) {
                    await session.abortTransaction();
                    return ApiResponse.error(res, {
                         error: 'Limit Exceeded',
                         message: `Daily withdrawal limit of ₹${user.dailyWithdrawalLimit} exceeded`,
                         statusCode: 400,
                    });
               }

               if (!canWithdraw(user, todayWithdrawalAmount)) {
                    return res
                         .status(400)
                         .json({ error: 'You cannot withdraw bonus amount' });
               }


               // Check if user has sufficient balance
               const requiredAmount = amount;


               if ((user.balance ?? 0) < requiredAmount) {
                    await session.abortTransaction();
                    return ApiResponse.error(res, {
                         error: 'Insufficient Balance',
                         message: 'Insufficient balance for withdrawal',
                         statusCode: 400,
                    });
               }

               // Lock the withdrawal amount
               user.lockedBalance += requiredAmount;
               user.balance -= requiredAmount;

               // Create transaction record
               const transaction = new TransactionModel({
                    user: userId,
                    type: 'withdrawal',
                    amount: amount,
                    balanceBefore: user.balance + requiredAmount,
                    balanceAfter: user.balance, 
                    userBalance: user.balance, 
                    
                    status: 'pending',
                    ipAddress: req.ip,
                    deviceInfo: {
                         userAgent: req.get('User-Agent'),
                         deviceType: req.get('User-Agent')?.includes('Mobile')
                              ? 'mobile'
                              : 'desktop',
                    },
               });

               await transaction.save({ session });

               // Add transaction to user's transaction history
               user.transactions.push(transaction._id);
               await user.save({ session });

               await session.commitTransaction();
               console.log(" amount is", user.balance)

               return ApiResponse.success(res, {
                    data: {
                         transactionId: transaction._id,
                         amount: user.balance,
                         status: transaction.status,
                         createdAt: transaction.createdAt,
                    },
                    message: 'Withdrawal request submitted successfully. It will be processed within 24 hours.',
                    statusCode: 201,
               });
          } catch (error: any) {
               await session.abortTransaction();
               console.error('Withdrawal Error:', error);
               return ApiResponse.error(res, {
                    error: 'Database Error',
                    message: error.message,
                    statusCode: 500,
               });
          } finally {
               session.endSession();
          }
     };





     /**
      * Get recent transactions for the user
      */
     static getRecentTransactions = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => {
          try {
               const userId = req.user?._id;
               const { page = 1, limit = 20, type, status } = req.query;

               // Build query
               const query: any = { user: userId };
               if (type) query.type = type;
               if (status) query.status = status;

               // Calculate pagination
               const pageNum = parseInt(page as string);
               const limitNum = parseInt(limit as string);
               const skip = (pageNum - 1) * limitNum;

               // Get transactions with pagination
               const [transactions, total] = await Promise.all([
                    TransactionModel.find(query)
                         .sort({ createdAt: -1 })
                         .skip(skip)
                         .limit(limitNum)
                         .select(
                              '-paymentDetails -adminNotes -deviceInfo -ipAddress',
                         )
                         .lean(),
                    TransactionModel.countDocuments(query),
               ]);

               // Calculate summary
               const summary = await TransactionModel.aggregate([
                    { $match: { user: new mongoose.Types.ObjectId(userId) } },
                    {
                         $group: {
                              _id: '$type',
                              totalAmount: { $sum: '$amount' },
                              count: { $sum: 1 },
                         },
                    },
               ]);

               const summaryData = {
                    totalDeposits:
                         summary.find((s) => s._id === 'deposit')
                              ?.totalAmount || 0,
                    totalWithdrawals:
                         summary.find((s) => s._id === 'withdrawal')
                              ?.totalAmount || 0,
                    totalTransactions: summary.reduce(
                         (acc, s) => acc + s.count,
                         0,
                    ),
               };

               return ApiResponse.success(res, {
                    data: {
                         transactions,
                         pagination: {
                              currentPage: pageNum,
                              totalPages: Math.ceil(total / limitNum),
                              totalRecords: total,
                              hasNext: pageNum < Math.ceil(total / limitNum),
                              hasPrev: pageNum > 1,
                         },
                         summary: summaryData,
                    },
                    message: 'Transactions retrieved successfully',
                    statusCode: 200,
               });
          } catch (error: any) {
               console.error('Get Transactions Error:', error);
               return ApiResponse.error(res, {
                    error: 'Database Error',
                    message: error.message,
                    statusCode: 500,
               });
          }
     };

     /**
      * Get single transaction details
      */
     static getTransactionDetails = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => {
          try {
               const { transactionId } = req.params;
               const userId = req.user?._id;

               // Validate transaction ID
               if (!mongoose.Types.ObjectId.isValid(transactionId)) {
                    return ApiResponse.error(res, {
                         error: 'Validation Error',
                         message: 'Invalid transaction ID',
                         statusCode: 400,
                    });
               }

               // Find transaction
               const transaction = await TransactionModel.findOne({
                    _id: transactionId,
                    user: userId,
               }).select('-adminNotes -deviceInfo -ipAddress');

               if (!transaction) {
                    return ApiResponse.error(res, {
                         error: 'Not Found',
                         message: 'Transaction not found',
                         statusCode: 404,
                    });
               }

               return ApiResponse.success(res, {
                    data: transaction,
                    message: 'Transaction details retrieved successfully',
                    statusCode: 200,
               });
          } catch (error: any) {
               console.error('Get Transaction Details Error:', error);
               return ApiResponse.error(res, {
                    error: 'Database Error',
                    message: error.message,
                    statusCode: 500,
               });
          }
     };

     /**
      * get all the transactions
      */
     static getAllTransaction = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => { };

     /**
      * Cancel pending transaction
      */
     static cancelTransaction = async (
          req: Request,
          res: Response,
          next: NextFunction,
     ) => {
          const session = await mongoose.startSession();

          try {
               await session.startTransaction();

               const { transactionId } = req.params;
               const userId = req.user?._id;

               // Find transaction
               const transaction = await TransactionModel.findOne({
                    _id: transactionId,
                    user: userId,
                    status: 'pending',
               }).session(session);

               if (!transaction) {
                    await session.abortTransaction();
                    return ApiResponse.error(res, {
                         error: 'Not Found',
                         message: 'Pending transaction not found',
                         statusCode: 404,
                    });
               }

               // Only allow cancellation of pending withdrawals
               if (transaction.type !== 'withdrawal') {
                    await session.abortTransaction();
                    return ApiResponse.error(res, {
                         error: 'Invalid Operation',
                         message: 'Only pending withdrawals can be cancelled',
                         statusCode: 400,
                    });
               }

               // Update transaction status
               transaction.status = 'cancelled';
               transaction.failureReason = 'Cancelled by user';
               await transaction.save({ session });

               // Release locked balance
               const user = await UserModel.findById(userId).session(session);
               if (user) {
                    user.balance += transaction.amount;
                    user.lockedBalance -= transaction.amount;
                    await user.save({ session });
               }

               await session.commitTransaction();

               return ApiResponse.success(res, {
                    data: {
                         transactionId: transaction._id,
                         status: transaction.status,
                    },
                    message: 'Transaction cancelled successfully',
                    statusCode: 200,
               });
          } catch (error: any) {
               await session.abortTransaction();
               console.error('Cancel Transaction Error:', error);
               return ApiResponse.error(res, {
                    error: 'Database Error',
                    message: error.message,
                    statusCode: 500,
               });
          } finally {
               session.endSession();
          }
     };
}

export default TransactionController;
