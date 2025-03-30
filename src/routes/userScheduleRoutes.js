import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { isMine, verifyUserSchedule, isMissingUserSchedule, isConflictUserSchedule } from "../middlewares/userScheduleMiddlewares.js";
import { viewUserSchedule , viewDetailUserSchedule, addUserSchedule, deleteUserSchedule, modifyUserSchedule } from "../controllers/userScheduleControllers.js";

const router = express.Router({ mergeParams: true }); 

//사용자 일정 관련 라우터

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.get("/", viewUserSchedule); //주간 일정 조회

router.get("/:userScheduleId", verifyUserSchedule, viewDetailUserSchedule); //세부 일정 조회

router.post("/", isMine, isMissingUserSchedule, isConflictUserSchedule,  addUserSchedule); //일정 추가

router.delete("/:userScheduleId", isMine, verifyUserSchedule, deleteUserSchedule); //일정 삭제

router.patch("/:userScheduleId",isMine, verifyUserSchedule,  isMissingUserSchedule, isConflictUserSchedule, modifyUserSchedule); //일정 수정

export default router;