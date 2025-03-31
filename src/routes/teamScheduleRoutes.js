import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { verifyTeamSchedule, isMissingTeamSchedule, isConflictSchedule } from "../middlewares/teamScheduleMiddlewares.js";
import { viewTeamSchedule , viewDetailTeamSchedule, addTeamSchedule, deleteTeamSchedule, modifyTeamSchedule } from "../controllers/teamScheduleControllers.js";

const router = express.Router({ mergeParams: true }); 
//동아리 일정 관련 라우터

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.get("/", viewTeamSchedule);

router.get("/:clubScheduleId", verifyTeamSchedule, viewDetailTeamSchedule)

router.post("/", isMissingTeamSchedule, isConflictSchedule, addTeamSchedule);

router.delete("/:clubScheduleId", verifyTeamSchedule, deleteTeamSchedule);

router.patch("/:clubScheduleId", verifyTeamSchedule, isMissingTeamSchedule, isConflictSchedule, modifyTeamSchedule);

export default router;