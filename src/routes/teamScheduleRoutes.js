import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { isMyTeam } from "../middlewares/teamScheduleMiddlewares.js";
import { viewTeamSchedule , viewDetailTeamSchedule, getTeamMember, addTeamSchedule, deleteTeamSchedule, modifyTeamSchedule, 
        findBestAvailableTime, addBestSchedule, sendScheduleToUser} from "../controllers/teamScheduleControllers.js";

const router = express.Router({ mergeParams: true }); 

//사용자 일정 관련 라우터

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.get("/", viewTeamSchedule);

router.get("/:teamScheduleId", viewDetailTeamSchedule);

router.get("/changeSchedule", getTeamMember)//추가, 수정시 필요함

router.post("/addSchedule", isMyTeam, addTeamSchedule);

router.delete("/:teamScheduleId", isMyTeam, deleteTeamSchedule);

router.patch("/:teamScheduleId", isMyTeam, modifyTeamSchedule);

router.get("/", findBestAvailableTime);

router.post("/addBestSchedule", addBestSchedule, sendScheduleToUser);

export default router;