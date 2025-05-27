// models/Market.js
const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true // e.g., "Lucky Number", "Color Bet", etc.
    },
    type: {
        type: String,
        enum: ['numbers', 'colors', 'cards', 'dice'], // Customize for your 8 markets
        required: true
    },
    active_hours: {
        open: { type: String, required: true }, 
        close: { type: String, required: true } 
    },
    current_winning_value: { // Can be number/string depending on market
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'result_declared'],
        default: 'closed'
    },
    odds: {
        type: Number,
        required: true 
    },
    allowed_values: [{ 
        type: mongoose.Schema.Types.Mixed,
        required: true
    }],
    result_declared_at: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Market', marketSchema);