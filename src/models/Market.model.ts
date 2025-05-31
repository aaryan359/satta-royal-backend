// models/Market.js
const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        unique: true // e.g., "Lucky Number", "Color Bet", etc.
    },

    active_hours: {
        open: { type: String, required: true },
        close: { type: String, required: true }
    },

    code: {
        type: String
    },

    current_winning_value: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },

    status: {
        type: String,
        enum: ['open', 'closed', 'result_declared'],
        default: 'open'
    },

    odds: {
        type: Number,
        required: true
    },

    // dont know what type it is, so using Mixed
    result_history: [{
        result: mongoose.Schema.Types.Mixed,
        declared_at: { type: Date, default: Date.now }
    }],

    allowed_values: [{
        type: mongoose.Schema.Types.Mixed,
        required: true
    }],

    result_declared_at: {
        type: Date,
        default: null
    }

}, { timestamps: true });


const MarketModel = mongoose.model('Market', marketSchema);
export default MarketModel;
