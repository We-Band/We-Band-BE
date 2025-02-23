import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

// Express 애플리케이션 설정
app.use(cookieParser());
app.use('/api/users', userRoutes);

// 환경 별 .env 파일 동작
console.log('Current Environment:', process.env.NODE_ENV);

export default app;