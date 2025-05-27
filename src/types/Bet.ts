import mongoose from "mongoose";

export interface IBet {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  game: mongoose.Types.ObjectId;
  region: mongoose.Types.ObjectId;
  number: number;
  amount: number;
  potentialWinnings: number;
  status: 'pending' | 'won' | 'lost';
  createdAt: Date;
}