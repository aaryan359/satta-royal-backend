import mongoose from 'mongoose';

export interface ITransaction {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  
  // Transaction Details
  type: 'deposit' | 'withdrawal' | 'bet_debit' | 'bet_credit' | 'bonus' | 'refund' | 'commission';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  
  // Payment Information
  paymentGatewayRef?: string;
  paymentMethod?: 'upi' | 'bank_transfer' | 'paytm' | 'phonepe' | 'googlepay' | 'razorpay' | 'cashfree';
  paymentDetails?: {
    upiId?: string;
    bankAccount?: string;
    bankName?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
  
  razorPayPaymentId:string
  // Reference Information
  referenceId?: mongoose.Types.ObjectId;
  referenceType?: 'bet' | 'bonus' | 'kyc_reward' | 'referral' | 'manual_adjustment';
  
  // Status and Processing
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  
  // Fee Information (for withdrawals)
  fee: number;
  netAmount: number;
  
  // Descriptions and Notes
  description?: string;
  adminNotes?: string;
  failureReason?: string;
  
  // Security and Tracking
  ipAddress?: string;
  deviceInfo?: {
    userAgent?: string;
    deviceType?: string;
  };
  
  // Timestamps
  requestedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  transactionAge?: number;
  
  // Methods
  isExpired?(): boolean;
}

// Enum for transaction types (for better type safety)
export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  BET_DEBIT = 'bet_debit',
  BET_CREDIT = 'bet_credit',
  BONUS = 'bonus',
  REFUND = 'refund',
  COMMISSION = 'commission'
}

// Enum for transaction status
export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Enum for payment methods
export enum PaymentMethod {
  UPI = 'upi',
  BANK_TRANSFER = 'bank_transfer',
  PAYTM = 'paytm',
  PHONEPE = 'phonepe',
  GOOGLEPAY = 'googlepay',
  RAZORPAY = 'razorpay',
  CASHFREE = 'cashfree'
}

// Interface for transaction summary
export interface ITransactionSummary {
  totalTransactions: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
}

// Interface for deposit request
export interface IDepositRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  paymentGatewayRef?: string;
  paymentDetails?: {
    upiId?: string;
    bankAccount?: string;
    bankName?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
}

// Interface for withdrawal request
export interface IWithdrawalRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDetails: {
    upiId?: string;
    bankAccount?: string;
    bankName?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
}

// Interface for transaction query parameters
export interface ITransactionQuery {
  page?: number;
  limit?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
  paymentMethod?: PaymentMethod;
}

// Interface for transaction response
export interface ITransactionResponse {
  transactionId: mongoose.Types.ObjectId;
  amount: number;
  fee?: number;
  netAmount?: number;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  createdAt: Date;
  description?: string;
}

// Interface for pagination
export interface IPagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  hasNext: boolean;
  hasPrev: boolean;
}