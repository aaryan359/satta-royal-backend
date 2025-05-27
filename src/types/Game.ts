import mongoose from "mongoose";
export interface IGame {
  _id: mongoose.Types.ObjectId;
  region: mongoose.Types.ObjectId;
  date: Date;
  bettingOpenTime: Date;
  bettingCloseTime: Date;
  winningNumber?: number;
  status: 'upcoming' | 'active' | 'completed';
  resultDeclarationTime: Date;
  bets?: mongoose.Types.ObjectId[]; 
  winningBets?: mongoose.Types.ObjectId[];
  createdAt: Date;
}