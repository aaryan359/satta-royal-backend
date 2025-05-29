import mongoose from 'mongoose';
import { IUser } from '../types/User';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Invalid email format'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v: string) => /^\+?[1-9]\d{9,14}$/.test(v),
      message: 'Invalid phone number format'
    }
  },
  
  // Main wallet balance
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  // Bonus balance (separate from main balance)
  bonusBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  // Locked balance (pending withdrawals)
  lockedBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  // Total deposits till date
  totalDeposits: {
    type: Number,
    default: 0,
    min: 0
  },
  // Total withdrawals till date
  totalWithdrawals: {
    type: Number,
    default: 0,
    min: 0
  },
  // Daily deposit limit
  dailyDepositLimit: {
    type: Number,
    default: 100000, // Default 1 lakh
    min: 0
  },
  // Daily withdrawal limit
  dailyWithdrawalLimit: {
    type: Number,
    default: 50000, // Default 50k
    min: 0
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  // Who referred this user
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  // Users referred by this user
  referrals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bet_history: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bet'
  }],
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  // KYC Information
  kycStatus: {
    type: String,
    required: true,
    enum: ['pending', 'submitted', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  kycDocuments: {
    aadhar: {
      number: String,
      frontImage: String,
      backImage: String
    },
    pan: {
      number: String,
      image: String
    },
    bankAccount: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      accountHolderName: String,
      passBookImage: String
    }
  },
  // Security and Status
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspensionReason: {
    type: String,
    maxlength: 500
  },
  // Login tracking
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  // Device and Location tracking
  registrationIP: {
    type: String
  },
  lastLoginIP: {
    type: String
  },
  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'ta', 'te', 'bn']
    },
    currency: {
      type: String,
      default: 'INR'
    }
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

UserSchema.index({ createdAt: -1 });

// Generate referral code before saving
UserSchema.pre('save', function (next) {
  if (this.isNew && !this.referralCode) {
    this.referralCode = `REF${Math.random().toString(36).substr(2, 6).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
  }
  next();
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Update timestamp on save
UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for account locked status
UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

// Virtual for available balance (balance - lockedBalance)
UserSchema.virtual('availableBalance').get(function () {
  return Math.max(0, this.balance - this.lockedBalance);
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
UserSchema.methods.incLoginAttempts = function (): Promise<any> {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates: any = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
UserSchema.methods.resetLoginAttempts = function (): Promise<any> {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

const UserModel = mongoose.model<IUser>('User', UserSchema);
export default UserModel;