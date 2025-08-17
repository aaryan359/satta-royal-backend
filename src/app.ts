import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import routes from './routes';
import { connectDB } from './config/dbconnect';

const app = express();


app.use(helmet()); 

app.use(morgan('common'))

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH', 'OPTIONS'],
  
  allowedHeaders: ['Content-Type', 'Authorization']
}));


if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev')); 
}


app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));


connectDB().then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});


console.log(" working in app.ts")

app.use('/api', routes);


app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Betting API'
  });
});


// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running smoothly'
  });
});


// Error Handling Middleware
app.use(notFound); // 404 handler
app.use(errorHandler); // Global error handler

export default app;