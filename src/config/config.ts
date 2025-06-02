import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  jwtSecret: string;
  corsOrigin: string;
  google_client_id:string
}

const config: Config = {
  port: Number(process.env.PORT) ,
  nodeEnv: process.env.NODE_ENV ?? (() => { throw new Error('NODE_ENV is not defined'); })(),
  mongoUri: process.env.MONGODB_URI ?? (() => { throw new Error('MONGODB_URI is not defined'); })(),
  jwtSecret: process.env.JWT_SECRET ?? (() => { throw new Error('JWT_SECRET is not defined'); })(),
  corsOrigin: process.env.CORS_ORIGIN ?? (() => { throw new Error('cors is not defined'); })(),
  google_client_id:process.env.GOOGLE_WEB_CLIENT_ID ??(()=>{throw new Error('cors is not defined'); })()

};

export default config;