import mongoose from "mongoose";

export interface IWithdrawal {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: 'bank' | 'upi';
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolder: string;
  };
  upiId?: string;
  status: 'pending' | 'processed' | 'rejected';
  requestedAt: Date;
  processedAt?: Date;
  createdAt: Date;
}