

import mongoose from 'mongoose';

const betSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  market: {
    type: String,
    required: true
  },

  number: { 
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true,
    min: 10
  },

  status: {
    type: String,
    enum: ['pending', 'won', 'lost'],
    default: 'pending'
  },

  payout: {
    type: Number,
    default: 0 
  },

  bet_placed_at: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

const BetModel = mongoose.model('Bet', betSchema);
export default BetModel;