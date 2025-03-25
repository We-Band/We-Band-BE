import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { isLeader } from "../middlewares/clubMiddlewares.js";
import { isExistClubSchedule, isConflictSchedule } from "../middlewares/clubScheduleMiddlewares.js";
import { viewClubSchedule , viewDetailClubSchedule, addClubSchedule, deleteClubSchedule, modifyClubSchedule } from "../controllers/clubScheduleControllers.js";

const router = express.Router({ mergeParams: true }); 

//동아리 일정 관련 라우터

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.get("/", viewClubSchedule);

router.get("/:clubScheduleId", isExistClubSchedule, viewDetailClubSchedule)

router.post("/", isLeader, isConflictSchedule, addClubSchedule);

router.delete("/:clubScheduleId", isLeader, isExistClubSchedule, deleteClubSchedule);

router.patch("/:clubScheduleId", isLeader, isExistClubSchedule, isConflictSchedule, modifyClubSchedule);

export default router;