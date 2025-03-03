import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { logger, morganMiddleware } from "./utils/logger.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const router = express.Router();

app.use(express.json()); // json
app.use(morganMiddleware); //api 로그 기록(개발 환경에서만)

// Express 애플리케이션 설정
app.use(cookieParser());

app.use("/user", userRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "서버가 정상적으로 동작 중입니다!" });
});

// 환경 별 .env 파일 동작
logger.info("Current Environment: " + process.env.NODE_ENV);

export default app;
