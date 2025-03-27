import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { isMine, verifyUserSchedule, isMissingUserSchedule, isConflictUserSchedule } from "../middlewares/userScheduleMiddlewares.js";
import { viewUserSchedule , viewDetailUserSchedule, addUserSchedule, deleteUserSchedule, modifyUserSchedule } from "../controllers/userScheduleControllers.js";

const router = express.Router({ mergeParams: true }); 

//사용자 일정 관련 라우터

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.get("/", viewUserSchedule);

router.get("/:userScheduleId", verifyUserSchedule, viewDetailUserSchedule);

router.post("/", isMine, isConflictUserSchedule, isMissingUserSchedule, addUserSchedule);

router.delete("/:userScheduleId", isMine, verifyUserSchedule, deleteUserSchedule);

router.patch("/:userScheduleId", isMine, verifyUserSchedule, isConflictUserSchedule, modifyUserSchedule);

export default router;