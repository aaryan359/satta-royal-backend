import mongoose from 'mongoose';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  phone: string;
  profilePicture: string;
  balance: number;
  bonusBalance: number;
  lockedBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  dailyDepositLimit: number;
  dailyWithdrawalLimit: number;
  resetPasswordOTP:string;
  resetPasswordOTPExpiry:Date;
  kycStatus: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  kycDocuments: {
    aadhar?: {
      number?: string;
      frontImage?: string;
      backImage?: string;
    };
    pan?: {
      number?: string;
      image?: string;
    };
    bankAccount?: {
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
      accountHolderName?: string;
      branchAddress: string;
      passBookImage?: string;
    };
  };
  bankAccount?: {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    accountHolderName?: string;
    branchAddress: string;
    passBookImage?: string;
  };
  isActive: boolean;
  isVerified: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  referrals: mongoose.Types.ObjectId[];
  referralBonus: number;
  referralBonusClaimed: boolean;
  referralBonusClaimedAt?: Date;
  referralBonusExpiry?: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  registrationIP?: string;
  lastLoginIP?: string;
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    language: 'en' | 'hi' | 'ta' | 'te' | 'bn';
    currency: string;
  };
  bet_history: mongoose.Types.ObjectId[];
  transactions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  isLocked?: boolean;
  availableBalance?: number;
  comparePassword?(candidatePassword: string): Promise<boolean>;
  incLoginAttempts?(): Promise<any>;
  resetLoginAttempts?(): Promise<any>;
}