import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/User.model';
import { IUser } from '../types/User';
import logger from '../config/logger';
import ApiResponse from '../utils/ApiResponse';
import { generateToken } from '../utils/genrate-jwt';



const UserController = {
  /**
   * Register a new user
   */
  register: async (req: Request, res: Response, next: NextFunction) =>{

    try {
      const { username, email, password, phone } = req.body;


      console.log(`Registering user with email: ${email}, username: ${username}`);
      console.log(`Request body: ${JSON.stringify(req.body)}`);


      // Check if username, email, and password are provided
      if (!username || !email || !password) {
        return ApiResponse.error(res, {
          error: 'Validation Error',
          message: 'Please provide username, email, and password',
          statusCode: 400
        });
      }

      // Check if user already exists
      const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });

      if (existingUser) {
        return ApiResponse.error(res, {
          error: 'Validation Error',
          message: 'Email or username already in use',
          statusCode: 400
        });
      }





      // Create new user
      const newUser = await UserModel.create({
        username,
        email,
        password,
        phone
      });


      // Generate JWT token
      const token = generateToken(newUser._id);

      console.log(`Generated token: ${token}`);

      return ApiResponse.success(res, {
        message: 'User registered successfully',
        data: {
          user: newUser,
          token
        },
        statusCode: 201
      })

    } catch (error: any) {
      console.log(`Registration error: ${error.message}`);
      next(error);
    }
  },



  /**
   * Login user
   */
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const { email, password } = req.body;


      if (!email || !password) {
        return ApiResponse.error(res, {
          error: 'Validation Error',
          message: 'Please provide email and password',
          statusCode: 400
        });
      }

      const user = await UserModel.findOne({ email });

      if (!user) {
        return ApiResponse.error(res, {
          error: ' User not found',
          message: 'User not found',
          statusCode: 401
        });
      }


      const token = generateToken(user._id);


      return ApiResponse.success(res, {
        message: 'User logged in successfully',
        data: {
          user,
          token
        },
        statusCode: 200
      });


    } catch (error: any) {
      logger.error(`Login error: ${error.message}`);
      next(error);
    }
  },

  /**
   * Get current user profile
   */
  getMe: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const user = await UserModel.findById(req.user?._id);

      if (!user) {
        return ApiResponse.error(res, {
          error: 'User not found',
          message: 'No user found with this ID',
          statusCode: 404
        });
      }

      return ApiResponse.success(res, {
        message: 'User profile retrieved successfully',
        data: user,
        statusCode: 200
      });

    } catch (error: any) {
      logger.error(`Get profile error: ${error.message}`);
      next(error);
    }
  },
  

  /**
   * Update user profile
   */
  updateMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Filter out unwanted fields
      const filteredBody: Partial<IUser> = {};
      const allowedFields = ['username', 'email', 'avatar'];

      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredBody[key as keyof IUser] = req.body[key];
        }
      });

      const updatedUser = await UserModel.findByIdAndUpdate(
        req.user?._id,
        filteredBody,
        { new: true, runValidators: true }
      );

      return ApiResponse.success(res, {
        message: 'User profile updated successfully',
        data: updatedUser,
        statusCode: 200
      });

    } catch (error: any) {
      logger.error(`Update profile error: ${error.message}`);
      next(error);
    }
  },

  /**
   * Delete user account
   */
  deleteMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await UserModel.findByIdAndUpdate(req.user?._id, { active: false });

      return ApiResponse.success(res, {
        message: 'User account deleted successfully',
        statusCode: 200
      });

    } catch (error: any) {
      logger.error(`Delete account error: ${error.message}`);
      next(error);
    }
  },



  /**
   * Submit KYC documents
   */
  submitKYC: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idNumber, idType, idFront, idBack } = req.body;

      const updatedUser = await UserModel.findByIdAndUpdate(
        req.user?._id,
        {
          kycStatus: 'pending',
          kycDocuments: {
            idNumber,
            idType,
            idFront,
            idBack
          }
        },
        { new: true }
      );

      return ApiResponse.success(res, {
        message: 'KYC documents submitted successfully',
        data: updatedUser,
        statusCode: 200
      });

    } catch (error: any) {
      logger.error(`KYC submission error: ${error.message}`);
      next(error);
    }
  },

  /**
   * Update user balance (for admin only)
   */

  updateBalance: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, amount } = req.body;

      const user = await UserModel.findByIdAndUpdate(
        userId,
        { $inc: { balance: amount } },
        { new: true }
      );

      return ApiResponse.success(res, {
        message: 'Balance updated successfully',
        data: user,
        statusCode: 200
      });

    } catch (error: any) {
      logger.error(`Balance update error: ${error.message}`);
      next(error);
    }
  },


  getBalance: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await UserModel.findById(req.user?._id).select('balance');
      
      if (!user) {
        return ApiResponse.error(res, {
          error: 'User not found',
          message: 'No user found with this ID',
          statusCode: 404
        });
      }

      return ApiResponse.success(res, {
        message: 'Balance retrieved successfully',
        data: { balance: user.balance }
      });
    } catch (error: any) {
      logger.error(`Get balance error: ${error.message}`);
      next(error);
    }
  },

  


}



export default UserController;

