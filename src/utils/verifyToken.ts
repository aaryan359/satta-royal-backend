
import jwt from 'jsonwebtoken';


// Function to verify JWT token
export const verifyToken = (token: string): string | jwt.JwtPayload => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded;
  } catch (error) {
    console.log(error);
    throw new Error('Invalid token');
  }
};
