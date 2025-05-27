
import jwt from 'jsonwebtoken';
import config from '../config/config';

// Function to verify JWT token
export const verifyToken = (token: string): string | jwt.JwtPayload => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};
