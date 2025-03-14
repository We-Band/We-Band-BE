import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { viewUserSchedule , viewDetailUserSchedule, addUserSchedule, deleteUserSchedule, modifyUserSchedule } from "../controllers/userScheduleControllers.js";

const router = express.Router({ mergeParams: true }); 

//동아리 일정 관련 라우터

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.get("/", viewUserSchedule);

router.get("/:userScheduleId", viewDetailUserSchedule);

router.post("/", addUserSchedule);

router.delete("/:userScheduleId", deleteUserSchedule);

router.patch("/:userScheduleId", modifyUserSchedule);

export default router;