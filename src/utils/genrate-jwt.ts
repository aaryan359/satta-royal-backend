// function to generate JWT token
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}


export const generateToken = (userId: object) => {
    console.log("Jwt secret in generate token", JWT_SECRET);
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "2d" });
};