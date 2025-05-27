import mongoose from 'mongoose';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  phone: string;
  balance: number;
  kycStatus: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  referredUsers?: mongoose.Types.ObjectId[];
  referralBonus: number;
  referralBonusClaimed: boolean;
  referralBonusClaimedAt?: Date;
  referralBonusExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  bet_history?: mongoose.Types.ObjectId[];
  transactions?: mongoose.Types.ObjectId[];
}