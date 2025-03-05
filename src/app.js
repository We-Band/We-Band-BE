import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { logger, morganMiddleware } from "./utils/logger.js";
import { authenticateUser } from "./middlewares/authMiddlewares.js";
import userRoutes from "./routes/userRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";

dotenv.config();

const app = express();

app.use(express.json()); // json
app.use(morganMiddleware); //api 로그 기록(개발 환경에서만)
app.use(authenticateUser); // 사용자 인증 미들웨어

// Express 애플리케이션 설정
app.use(cookieParser());

app.use("/user", userRoutes);
app.use("/clubs", clubRoutes);

//postman 테스트용 코드
import jwt from "jsonwebtoken";
const token = jwt.sign({ userId: 1}, "secret", { expiresIn: "10h" });
console.log(token);


app.get("/", (req, res) => {
  res.status(200).json({ message: "서버가 정상적으로 동작 중입니다!" });
});

// 환경 별 .env 파일 동작
logger.info("Current Environment: " + process.env.NODE_ENV);

export default app;
