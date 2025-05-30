import mongoose from "mongoose";
import { ITransaction } from "../types/Transaction";

const TransactionSchema = new mongoose.Schema<ITransaction>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['deposit', 'withdrawal', 'bet_debit', 'bet_credit', 'bonus', 'refund', 'commission']
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  // For gambling apps, tracking before/after balance is crucial
  balanceBefore: {
    type: Number,
    required: true,
    min: 0
  },
  balanceAfter: {
    type: Number,
    required: true,
    min: 0
  },
 
  paymentGatewayRef: {
    type: String,
    sparse: true // Only for deposit/withdrawal transactions
  },
  // Internal reference (bet ID, bonus ID, etc.)
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    sparse: true
  },
  referenceType: {
    type: String,
    enum: ['bet', 'bonus', 'kyc_reward', 'referral', 'manual_adjustment'],
    sparse: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  // Payment method for deposits/withdrawals
  paymentMethod: {
    type: String,
    enum: ['upi', 'bank_transfer', 'paytm', 'phonepe', 'googlepay', 'razorpay', 'cashfree','QrCode'],
    sparse: true
  },
  

  paymentDetails: {
    upiId: String,
    bankAccount: String,
    bankName: String,
    ifscCode: String,
    accountHolderName: String
  },
  // Transaction fee (for withdrawals)
  fee: {
    type: Number,
    default: 0,
    min: 0
  },
  // Net amount after fee deduction
  netAmount: {
    type: Number,
    min: 0
  },
  // Transaction description/notes
  description: {
    type: String,
    maxlength: 500
  },
  // Admin notes (for manual transactions)
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  // For failed transactions
  failureReason: {
    type: String,
    maxlength: 500
  },
  // IP address for security tracking
  ipAddress: {
    type: String
  },
  // Device info for security
  deviceInfo: {
    userAgent: String,
    deviceType: String
  },
  requestedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  processedAt: {
    type: Date,
    index: true
  },
  completedAt: {
    type: Date,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for better query performance
TransactionSchema.index({ user: 1, type: 1 });
TransactionSchema.index({ user: 1, status: 1 });
TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ paymentGatewayRef: 1 }, { sparse: true });
TransactionSchema.index({ requestedAt: -1 });

// Pre-save middleware to update timestamps and calculate net amount
TransactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate net amount (amount - fee)
  if (this.type === 'withdrawal') {
    this.netAmount = this.amount - (this.fee || 0);
  } else {
    this.netAmount = this.amount;
  }
  
  next();
});

// Virtual for transaction age
TransactionSchema.virtual('transactionAge').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Method to check if transaction is expired (pending for too long)
TransactionSchema.methods.isExpired = function(): boolean {
  const EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes
  return this.status === 'pending' && this.transactionAge > EXPIRY_TIME;
};

const TransactionModel = mongoose.model<ITransaction>('Transaction', TransactionSchema);
export default TransactionModel;