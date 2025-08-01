"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const RegionSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const RegionModel = mongoose_1.default.model('Region', RegionSchema);
exports.default = RegionModel;
