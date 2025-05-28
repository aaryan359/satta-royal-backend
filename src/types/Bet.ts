import mongoose from "mongoose";

export interface IBet {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  market: mongoose.Types.ObjectId;
  number: number;
  amount: number;
  potentialWinnings: number;
  status: 'pending' | 'won' | 'lost';
  time:string,
  createdAt: Date;
}