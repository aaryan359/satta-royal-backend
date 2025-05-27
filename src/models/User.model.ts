import mongoose from 'mongoose';
import { IUser } from '../types/User';
import bcrypt from 'bcryptjs';



const UserSchema = new mongoose.Schema<IUser>({

  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30
  },

  email: {
    type: String,
    required: true,
    unique: true,
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
    validate: {
      validator: (v: string) => /^\+?[1-9]\d{1,14}$/.test(v),
      message: 'Invalid phone number format'
    }
  },

  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  referralCode: {
    type: String,
    unique: true,
    default: function (this: IUser) {
      return `REF-${this._id.toString().slice(-6).toUpperCase()}`;
    }
  },
  bet_history: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bet'
  }],
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],

  kycStatus: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  isActive: {
    type: Boolean,
    required: true,
    default: true
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
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update timestamp on save
UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});


const UserModel = mongoose.model<IUser>('User', UserSchema);
export default UserModel;