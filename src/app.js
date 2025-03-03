import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { logger, morganMiddleware } from './utils/logger.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

app.use(morganMiddleware); //api 로그 기록(개발 환경에서만)

// Express 애플리케이션 설정
app.use(cookieParser());
app.use('/users', userRoutes);

// 환경 별 .env 파일 동작
logger.info('Current Environment: ' + process.env.NODE_ENV);

export default app;