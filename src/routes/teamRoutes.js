import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { isTeamLeader } from "../middlewares/teamMiddlewares.js"; 
import { createTeam, addTeamMembers, deleteTeam } from "../controllers/teamControllers.js"; 

const router = express.Router({ mergeParams: true }); // mergeParams 추가

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.post("/create", createTeam);
router.post("/:teamId/addMember", isTeamLeader, addTeamMembers);
router.delete("/:teamId/delete", isTeamLeader, deleteTeam);



export default router;