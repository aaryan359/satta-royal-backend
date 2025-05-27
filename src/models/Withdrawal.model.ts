import mongoose from "mongoose";
import { IWithdrawal } from "../types/Withdrawal";



const WithdrawalSchema = new mongoose.Schema<IWithdrawal>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // amount is the total amount to be withdrawn
    // It should be a positive number and greater than or equal to the minimum withdrawal amount
    amount: {
        type: Number,
        required: true,
        min: 100 // Minimum withdrawal amount
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
            validator: function (this: IWithdrawal, v: string) {
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