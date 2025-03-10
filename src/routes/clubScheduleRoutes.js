import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { isLeader } from "../middlewares/clubMiddlewares.js";
import { viewSchedule ,viewDetailchedule, addSchedule, deleteSchedule, modifySchedule } from "../controllers/clubScheduleControllers.js";

const router = express.Router();

//동아리 일정 관련 라우터

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.get("/", viewSchedule);

router.get("/:clubScheduleId", viewDetailchedule)

router.post("/", isLeader, addSchedule);

router.delete("/:clubScheduleId", isLeader, deleteSchedule);

router.put("/:clubScheduleId", isLeader, modifySchedule);

export default router;