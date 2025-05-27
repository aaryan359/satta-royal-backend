import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp, stack }) => 
            `${timestamp} ${level}: ${message}${stack ? `\n${stack}` : ''}`
        )
      )
    })
  ]
});

// Handle uncaught exceptions
logger.exceptions.handle(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        ({ level, message, timestamp, stack }) => 
          `${timestamp} ${level}: UNCAUGHT EXCEPTION - ${message}${stack ? `\n${stack}` : ''}`
      )
    )
  })
);

export default logger;