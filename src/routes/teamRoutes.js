import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { isTeamLeader, isTeamMember } from "../middlewares/teamMiddlewares.js";
import {
  myTeam,
  allTeam,
  viewMembers,
  createTeam,
  addTeamMembers,
  deleteTeam,
  deleteTeamMember,
} from "../controllers/teamControllers.js";

const router = express.Router({ mergeParams: true }); // mergeParams 추가

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.get("/myTeam", myTeam);
router.get("/:teamId/viewMember", isTeamMember, viewMembers);
router.get("/allTeam", allTeam);
router.post("/create", createTeam);
router.post("/:teamId/addMember", isTeamLeader, addTeamMembers); 
router.delete("/:teamId/delete", isTeamLeader, deleteTeam);
router.delete("/:teamId/deleteMember", isTeamLeader, deleteTeamMember);

export default router;
