import mongoose from 'mongoose';
import config from './config';
import logger from './logger';

const MONGODB_URI = config.mongoUri;

export const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MongoDB connection URI not defined');
    }

    const conn = await mongoose.connect(MONGODB_URI);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Connection events
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`Mongoose connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from DB');
    });
  } catch (err) {
    logger.error(`Database connection error: ${err}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('Database disconnected');
  } catch (err) {
    logger.error(`Error disconnecting from database: ${err}`);
  }
};