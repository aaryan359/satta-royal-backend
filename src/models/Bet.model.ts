import mongoose from "mongoose";
import { IBet } from "../types/Bet";



const BetSchema = new mongoose.Schema<IBet>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    region: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Region',
        required: true
    },
    number: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },

    amount: {
        type: Number,
        required: true,
        min: 1
    },

    potentialWinnings: {
        type: Number,
        required: true,
        default: function (this: IBet) {
            return this.amount * 100;
        }
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'won', 'lost'],
        default: 'pending'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for performance
BetSchema.index({ user: 1 });
BetSchema.index({ game: 1 });
BetSchema.index({ region: 1 });
BetSchema.index({ status: 1 });