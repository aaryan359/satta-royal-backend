"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const betSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    marketId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Market',
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
const BetModel = mongoose_1.default.model('Bet', betSchema);
exports.default = BetModel;
