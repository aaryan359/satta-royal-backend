import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/User.model';
import { IUser } from '../types/User';
import logger from '../config/logger';
import ApiResponse from '../utils/ApiResponse';
import { generateToken } from '../utils/genrate-jwt';
import config from '../config/config';
import { OAuth2Client } from 'google-auth-library';
import { validateIFSC } from '../utils/validations';
import { generateOTP } from '../utils/GenrateOTP';
import transporter from '../utils/EmailTransport';


const UserController = {
     /**
      * Register a new user
      */
     register: async (req: Request, res: Response, next: NextFunction) => {
          try {
               const { username, email, password, phone } = req.body;

               console.log(
                    `Registering user with email: ${email}, username: ${username}`,
               );
               console.log(`Request body: ${JSON.stringify(req.body)}`);

               // Check if username, email, and password are provided
               if (!username || !email || !password) {
                    return ApiResponse.error(res, {
                         error: 'Validation Error',
                         message: 'Please provide username, email, and password',
                         statusCode: 400,
                    });
               }

               // Check if user already exists
               const existingUser = await UserModel.findOne({
                    $or: [{ email }, { username }],
               });

               if (existingUser) {
                    return ApiResponse.error(res, {
                         error: 'Validation Error',
                         message: 'Email or username already in use',
                         statusCode: 400,
                    });
               }

               

               // Create new user
               const newUser = await UserModel.create({
                    username,
                    email,
                    password,
                    phone,
               });

               // Generate JWT token
               const token = generateToken(newUser._id);

               console.log(`Generated token: ${token}`);

               return ApiResponse.success(res, {
                    message: 'User registered successfully',
                    data: {
                         user: newUser,
                         token,
                    },
                    statusCode: 201,
               });
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
                         statusCode: 400,
                    });
               }

               const user = await UserModel.findOne({ email });


               if (!user) {
                    return ApiResponse.error(res, {
                         error: ' User not found',
                         message: 'User not found',
                         statusCode: 401,
                    });
               }




               if(user?.password != password){
                    return ApiResponse.error(res, {
                         error: 'Password wrong',
                         message: 'Wrong Password',
                         statusCode: 401,
                    });

               }


               const token = generateToken(user._id);

               return ApiResponse.success(res, {
                    message: 'User logged in successfully',
                    data: {
                         user,
                         token,
                    },
                    statusCode: 200,
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
                         statusCode: 404,
                    });
               }

               return ApiResponse.success(res, {
                    message: 'User profile retrieved successfully',
                    data: user,
                    statusCode: 200,
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

               Object.keys(req.body).forEach((key) => {
                    if (allowedFields.includes(key)) {
                         filteredBody[key as keyof IUser] = req.body[key];
                    }
               });

               const updatedUser = await UserModel.findByIdAndUpdate(
                    req.user?._id,
                    filteredBody,
                    { new: true, runValidators: true },
               );

               return ApiResponse.success(res, {
                    message: 'User profile updated successfully',
                    data: updatedUser,
                    statusCode: 200,
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
               await UserModel.findByIdAndUpdate(req.user?._id, {
                    active: false,
               });

               return ApiResponse.success(res, {
                    message: 'User account deleted successfully',
                    statusCode: 200,
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
                              idBack,
                         },
                    },
                    { new: true },
               );

               return ApiResponse.success(res, {
                    message: 'KYC documents submitted successfully',
                    data: updatedUser,
                    statusCode: 200,
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
                    { new: true },
               );

               return ApiResponse.success(res, {
                    message: 'Balance updated successfully',
                    data: user,
                    statusCode: 200,
               });
          } catch (error: any) {
               logger.error(`Balance update error: ${error.message}`);
               next(error);
          }
     },

     getBalance: async (req: Request, res: Response, next: NextFunction) => {
          try {
               const user = await UserModel.findById(req.user?._id).select(
                    'balance',
               );

               if (!user) {
                    return ApiResponse.error(res, {
                         error: 'User not found',
                         message: 'No user found with this ID',
                         statusCode: 404,
                    });
               }

               return ApiResponse.success(res, {
                    message: 'Balance retrieved successfully',
                    data: { balance: user.balance },
               });
          } catch (error: any) {
               logger.error(`Get balance error: ${error.message}`);
               next(error);
          }
     },

     Oauth: async (req: Request, res: Response, next: NextFunction) => {
          const client = new OAuth2Client(config.google_client_id);
          console.log('req body', req.body);

          const { token, user } = req.body;

          console.log('token and mail is', token, user);

          try {
               const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: config.google_client_id,
               });

               const payload = ticket.getPayload();
               console.log('payload from google is', payload);

               // Check email match
               if (payload?.email !== user.email) {
                    return res.status(401).json({ error: 'Email mismatch' });
               }

               const email = payload?.email;
               const username = payload?.name;
               const profile = payload?.profile;

               const dbUser = await UserModel.findOne({ email });

               // if user already registered
               if (dbUser) {
                    const token = generateToken(dbUser._id);

                    return ApiResponse.success(res, {
                         message: 'User logged in successfully',
                         data: {
                              dbUser,
                              token,
                         },
                         statusCode: 200,
                    });
               }

               // if fresh user came
               // Create new user
               if (!dbUser) {
                    const newUser = await UserModel.create({
                         email,
                         username,
                         profilePicture: profile,
                    });

                    // Generate JWT token
                    const token = generateToken(newUser._id);

                    console.log(`Generated token: ${token}`);

                    return ApiResponse.success(res, {
                         message: 'User registered successfully',
                         data: {
                              user: newUser,
                              token,
                         },
                         statusCode: 201,
                    });
               }
          } catch (err) {
               ApiResponse.error(res, {
                    error: 'Invalid ID token',
                    statusCode: 401,
               });
          }
     },

     addBank: async (req: Request, res: Response, next: NextFunction) => {
          try {
               const { data } = req.body;
               const userId = req.user?._id;

               // Validate required fields
               if (
                    !data ||
                    !data.accountNumber ||
                    !data.accountHolderName ||
                    !data.ifsc ||
                    !data.bankName
               ) {
                    return ApiResponse.error(res, {
                         message: 'Missing required fields: accountNumber, accountHolderName, ifsc, bankName',
                         statusCode: 400,
                    });
               }

               // Validate IFSC code format (implement this function)
               if (!validateIFSC(data.ifsc)) {
                    return ApiResponse.error(res, {
                         message: 'Invalid IFSC code format',
                         statusCode: 400,
                    });
               }

               // Validate account number (basic check)
               if (!/^\d{9,18}$/.test(data.accountNumber)) {
                    return res.status(400).json({
                         success: false,
                         message: 'Account number must be 9-18 digits',
                    });
               }

               // Check if bank details already exist for this user
               const existingUser = await UserModel.findById(userId);
               console.log('existing usser', existingUser);

               if (existingUser?.bankAccount?.accountNumber) {
                    return ApiResponse.error(res, {
                         message: 'Bank account already exists. Please update instead of adding new.',
                         statusCode: 400,
                    });
               }

               // Prepare bank account object
               const bankAccount = {
                    bankName: data.bankName.trim(),
                    accountHolderName: data.accountHolderName.trim(),
                    accountNumber: data.accountNumber.trim(),
                    ifscCode: data.ifsc.trim().toUpperCase(),
                    branchAddress: data.branch?.trim() || '',
               };

               // Update user with bank details
               const updatedUser = await UserModel.findByIdAndUpdate(
                    userId,
                    { $set: { bankAccount } },
                    { new: true, runValidators: true },
               );

               console.log('updayed user', updatedUser);
               if (!updatedUser) {
                    return ApiResponse.error(res, {
                         message: 'User not found',
                         statusCode: 404,
                    });
               }

               // Log the action (implement your logging system)
               console.log(`Bank details added for user: ${userId}`);

               return ApiResponse.success(res, {
                    message: 'Bank details added successfully',
                    data: { bankAccount: updatedUser.bankAccount },
                    statusCode: 200,
               });
          } catch (error) {
               ApiResponse.error(res, {
                    message: 'Internal server error',
                    statusCode: 500,
               });
          }
     },

     forgotPassword: async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const { email } = req.body;

            // Validate email
            if (!email) {
                return ApiResponse.error(res, {
                    error: 'Validation Error',
                    message: 'Email is required',
                    statusCode: 400,
                });
            }

            // Check if user exists
            const user = await UserModel.findOne({ email });
            if (!user) {
                return ApiResponse.error(res, {
                    error: 'Not Found',
                    message: 'No user found with this email',
                    statusCode: 404,
                });
            }

            // Generate OTP
            const otp = generateOTP();
            const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

            // Save OTP to user document
            user.resetPasswordOTP = otp;
            user.resetPasswordOTPExpiry = otpExpiry;
            await user.save();

            // Send email with OTP
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset OTP',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #4F46E5;">Password Reset Request</h2>
                        <p>You requested to reset your password. Here is your OTP:</p>
                        <div style="background: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0;">
                            <h1 style="margin: 0; color: #4F46E5; font-size: 32px;">${otp}</h1>
                        </div>
                        <p>This OTP is valid for 15 minutes.</p>
                        <p>If you didn't request this, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
                        <p style="color: #6B7280; font-size: 14px;">© ${new Date().getFullYear()} Your App Name</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);

            return ApiResponse.success(res, {
                message: 'OTP sent to your email',
                statusCode: 200,
                data: { email }
            });

        } catch (error) {
            console.error('Forgot password error:', error);
            return ApiResponse.error(res, {
                error: 'Server Error',
                message: 'Failed to process forgot password request',
                statusCode: 500
            });
        }
     },


     verifyOtp: async (req: Request, res: Response, next: NextFunction)=> {
        try {
            const { email, otp } = req.body;

            // Validate input
            if (!email || !otp) {
                return ApiResponse.error(res, {
                    error: 'Validation Error',
                    message: 'Email and OTP are required',
                    statusCode: 400,
                });
            }

            // Find user
            const user = await UserModel.findOne({ email });
            if (!user) {
                return ApiResponse.error(res, {
                    error: 'Not Found',
                    message: 'No user found with this email',
                    statusCode: 404,
                });
            }

            // Check if OTP matches and is not expired
            if (user.resetPasswordOTP !== otp || 
                !user.resetPasswordOTPExpiry || 
                new Date() > user.resetPasswordOTPExpiry) {
                return ApiResponse.error(res, {
                    error: 'Invalid OTP',
                    message: 'Invalid or expired OTP',
                    statusCode: 400,
                });
            }

            // OTP is valid
            return ApiResponse.success(res, {
                message: 'OTP verified successfully',
                statusCode: 200,
                data: { email, otp }
            });

        } catch (error) {
            console.error('Verify OTP error:', error);
            return ApiResponse.error(res, {
                error: 'Server Error',
                message: 'Failed to verify OTP',
                statusCode: 500
            });
        }
    },
    resetPassword: async (req: Request, res: Response, next: NextFunction) =>{
        try {
            const { email, otp, newPassword } = req.body;

            // Validate input
            if (!email || !otp || !newPassword) {
                return ApiResponse.error(res, {
                    error: 'Validation Error',
                    message: 'Email, OTP and new password are required',
                    statusCode: 400,
                });
            }

            // Find user
            const user = await UserModel.findOne({ email });
            if (!user) {
                return ApiResponse.error(res, {
                    error: 'Not Found',
                    message: 'No user found with this email',
                    statusCode: 404,
                });
            }

            // Verify OTP again (in case it took a while to submit new password)
            if (user.resetPasswordOTP !== otp || 
                !user.resetPasswordOTPExpiry || 
                new Date() > user.resetPasswordOTPExpiry) {
                return ApiResponse.error(res, {
                    error: 'Invalid OTP',
                    message: 'Invalid or expired OTP',
                    statusCode: 400,
                });
            }

            // Update password
            user.password = newPassword;
            user.resetPasswordOTP = "";
            user.resetPasswordOTPExpiry = new Date(Date.now());
            await user.save();

            return ApiResponse.success(res, {
                message: 'Password reset successfully',
                statusCode: 200,
            });

        } catch (error) {
            console.error('Reset password error:', error);
            return ApiResponse.error(res, {
                error: 'Server Error',
                message: 'Failed to reset password',
                statusCode: 500
            });
        }
    }

};

export default UserController;
