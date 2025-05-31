"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const WithdrawalSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // amount is the total amount to be withdrawn
    // It should be a positive number and greater than or equal to the minimum withdrawal amount
    amount: {
        type: Number,
        required: true,
        min: 100
    },
    // paymentMethod indicates the method of withdrawal
    // It can be either 'bank' or 'upi'
    paymentMethod: {
        type: String,
        required: true,
        enum: ['bank', 'upi']
    },
    // bankDetails is an optional field that contains the bank account details
    bankDetails: {
        accountNumber: { type: String },
        ifscCode: { type: String },
        accountHolder: { type: String }
    },
    // upiId is an optional field that contains the UPI ID
    upiId: {
        type: String,
        validate: {
            validator: function (v) {
                if (this.paymentMethod === 'upi') {
                    return /^[\w.-]+@[\w]+$/.test(v); // Simple UPI validation
                }
                return true;
            },
            message: 'Invalid UPI ID format'
        }
    },
    // status indicates the current state of the withdrawal
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processed', 'rejected'],
        default: 'pending'
    },
    // requestedAt is the date when the withdrawal was requested
    requestedAt: {
        type: Date,
        default: Date.now
    },
    // processedAt is optional and will be set when the withdrawal is processed
    processedAt: { type: Date },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
// Indexes
WithdrawalSchema.index({ user: 1 });
WithdrawalSchema.index({ status: 1 });
