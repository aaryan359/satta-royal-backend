import mongoose from "mongoose";

export interface ITransaction {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: 'deposit' | 'withdrawal' | 'bet' | 'winning';
  amount: number;
  referenceId?: mongoose.Types.ObjectId; // For bet or withdrawal reference
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}