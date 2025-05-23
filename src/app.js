import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import compression from "compression";
import { logger, morganMiddleware } from "./utils/logger.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";
import clubScheduleRoutes from "./routes/clubScheduleRoutes.js";
import userScheduleRoutes from "./routes/userScheduleRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import teamScheduleRoutes from "./routes/teamScheduleRoutes.js";

dotenv.config();

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000", // 또 다른 로컬 포트
    "https://we-band.vercel.app/", // 배포된 프론트 주소
  ],
  credentials: true, // 쿠키 및 인증 헤더 허용
  allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
  exposedHeaders: ["x-access-token", "Content-Encoding"],
};

// Express 애플리케이션 설정
app.use(cors(corsOptions));
app.use(express.json()); // json
app.use(morganMiddleware); //api 로그 기록(개발 환경에서만)
app.use(cookieParser());

//gzip 압축 미들웨어 설정
app.use(
  compression({
    level: 6,
    threshold: 10 * 1024, //100KB 이상인 경우에만 압축
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        // header에 x-no-compression이 있으면, 압축하지 않도록 false를 반환한다.
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/clubs", clubRoutes);
app.use("/clubs/:clubId/club-schedules", clubScheduleRoutes);
app.use("/users/:userId/user-schedules", userScheduleRoutes);
app.use("/clubs/:clubId/teams", teamRoutes);
app.use("/clubs/:clubId/teams/:teamId/team-schedules", teamScheduleRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "서버가 정상적으로 동작 중입니다!" });
});

// 환경 별 .env 파일 동작
logger.info("Current Environment: " + process.env.NODE_ENV);

export default app;
