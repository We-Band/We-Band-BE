import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { isLeader } from "../middlewares/clubMiddlewares.js";
import { verifyClubSchedule, isMissingClubSchedule, isConflictSchedule } from "../middlewares/clubScheduleMiddlewares.js";
import { viewClubSchedule , viewDetailClubSchedule, addClubSchedule, deleteClubSchedule, modifyClubSchedule } from "../controllers/clubScheduleControllers.js";

const router = express.Router({ mergeParams: true }); 

//동아리 일정 관련 라우터

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.get("/", viewClubSchedule);

router.get("/:clubScheduleId", verifyClubSchedule, viewDetailClubSchedule)

router.post("/", isLeader, isConflictSchedule, isMissingClubSchedule, addClubSchedule);

router.delete("/:clubScheduleId", isLeader, verifyClubSchedule, deleteClubSchedule);

router.patch("/:clubScheduleId", isLeader, verifyClubSchedule, isMissingClubSchedule, isConflictSchedule, modifyClubSchedule);

export default router;