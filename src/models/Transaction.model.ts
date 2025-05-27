import mongoose from "mongoose";
import { ITransaction } from "../types/Transaction";



const TransactionSchema = new mongoose.Schema<ITransaction>({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['deposit', 'withdrawal', 'bet', 'winning']
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0.01
  },
  referenceId: { 
    type: mongoose.Schema.Types.ObjectId 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  
  createdAt: { type: Date, default: Date.now }
});

// Indexes
TransactionSchema.index({ user: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ status: 1 });