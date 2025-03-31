import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { verifyTeamSchedule, isTeamMember, isMissingTeamSchedule, isConflictSchedule } from "../middlewares/teamScheduleMiddlewares.js";
import { viewTeamSchedule , viewDetailTeamSchedule, addTeamSchedule, deleteTeamSchedule, modifyTeamSchedule } from "../controllers/teamScheduleControllers.js";

const router = express.Router({ mergeParams: true }); 
//동아리 일정 관련 라우터

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.get("/", viewTeamSchedule);

router.get("/:teamScheduleId", verifyTeamSchedule, viewDetailTeamSchedule)

router.post("/", isTeamMember, isMissingTeamSchedule, isConflictSchedule, addTeamSchedule);

router.delete("/:teamScheduleId", isTeamMember, verifyTeamSchedule, deleteTeamSchedule);

router.patch("/:teamScheduleId", isTeamMember, verifyTeamSchedule,  isMissingTeamSchedule, isConflictSchedule, modifyTeamSchedule);

export default router;