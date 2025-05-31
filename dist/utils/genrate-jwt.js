"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
// function to generate JWT token
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}
const generateToken = (userId) => {
    console.log("Jwt secret in generate token", JWT_SECRET);
    return jsonwebtoken_1.default.sign({ id: userId }, JWT_SECRET, { expiresIn: "2d" });
};
exports.generateToken = generateToken;
