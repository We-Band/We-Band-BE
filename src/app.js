import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { logger, morganMiddleware } from "./utils/logger.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";

dotenv.config();

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:5173', // 프론트엔드 로컬 환경
  ],
  credentials: true, // 쿠키 및 인증 헤더 허용
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  exposedHeaders: ['x-access-token'],
};

// Express 애플리케이션 설정
app.use(cors(corsOptions));
app.use(express.json()); // json
app.use(morganMiddleware); //api 로그 기록(개발 환경에서만)
app.use(cookieParser());


app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/clubs", clubRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "서버가 정상적으로 동작 중입니다!" });
});

// 환경 별 .env 파일 동작
logger.info("Current Environment: " + process.env.NODE_ENV);

export default app;
