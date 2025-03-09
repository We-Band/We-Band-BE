import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { isLeader } from "../middlewares/clubMiddlewares.js";
import { viewMonthSchedule, viewWeekSchedule, viewDetailchedule, addSchedule, deleteSchedule, modifySchedule } from "../controllers/clubScheduleControllers.js";
import { isClubScheduleExist } from "../middlewares/clubScheduleMiddlewares.js";

const router = express.Router();

//동아리 일정 관련 라우터

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.get("/month", viewMonthSchedule);

router.get("/week", viewWeekSchedule);

router.get("/:scheduleId", viewDetailchedule)

router.post("/", isLeader, addSchedule);

router.delete("/:scheduleId", isLeader, deleteSchedule);

router.put("/:scheduleId", isLeader, modifySchedule);

export default router;