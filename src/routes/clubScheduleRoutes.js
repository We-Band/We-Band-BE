import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { isLeader } from "../middlewares/clubMiddlewares.js";
import {
  verifyClubSchedule,
  isMissingClubSchedule,
  isConflictSchedule,
} from "../middlewares/clubScheduleMiddlewares.js";
import {
  viewClubSchedule,
  viewDetailClubSchedule,
  addClubSchedule,
  deleteClubSchedule,
  updateClubSchedule,
} from "../controllers/clubScheduleControllers.js";

const router = express.Router({ mergeParams: true });

//동아리 일정 관련 라우터

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.get("/", viewClubSchedule); // 동아리 일정 조회 (주 단위)

router.get("/:clubScheduleId", verifyClubSchedule, viewDetailClubSchedule); // 동아리 일정 상세 조회

router.post(
  "/",
  isLeader,
  isMissingClubSchedule,
  isConflictSchedule,
  addClubSchedule
); // 동아리 일정 추가

router.delete(
  "/:clubScheduleId",
  isLeader,
  verifyClubSchedule,
  deleteClubSchedule
); // 동아리 일정 삭제

router.patch(
  "/:clubScheduleId",
  isLeader,
  verifyClubSchedule,
  isMissingClubSchedule,
  isConflictSchedule,
  updateClubSchedule
); // 동아리 일정 수정

export default router;
