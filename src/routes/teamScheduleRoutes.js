import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import {
  verifyTeamSchedule,
  isTeamMember,
  isMissingTeamSchedule,
  isConflictSchedule,
} from "../middlewares/teamScheduleMiddlewares.js";
import {
  viewTeamSchedule,
  viewDetailTeamSchedule,
  addTeamSchedule,
  deleteTeamSchedule,
  modifyTeamSchedule,
  adjustSchedule,
} from "../controllers/teamScheduleControllers.js";

const router = express.Router({ mergeParams: true });
//동아리 일정 관련 라우터

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.get("/", viewTeamSchedule); //팀 주간 일정 조회

router.get("/:teamScheduleId", verifyTeamSchedule, viewDetailTeamSchedule); // 팀 세부 일정 조회

router.post(
  "/",
  isTeamMember,
  isMissingTeamSchedule,
  isConflictSchedule,
  addTeamSchedule
); //팀 일정 추가

router.delete(
  "/:teamScheduleId",
  isTeamMember,
  verifyTeamSchedule,
  deleteTeamSchedule
); //팀 일정 삭제

router.patch(
  "/:teamScheduleId",
  isTeamMember,
  verifyTeamSchedule,
  isMissingTeamSchedule,
  isConflictSchedule,
  modifyTeamSchedule
); //팀 일정 수정

router.get("/adjustment", isTeamMember, adjustSchedule); //팀일정 조율

export default router;
