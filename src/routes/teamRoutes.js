import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { verifyClub } from "../middlewares/clubMiddlewares.js";
import { verifyTeam, isTeamLeader, isMyTeam, isUserJoinedTeam } from "../middlewares/teamMiddlewares.js";
import { getTeam, viewTeam, viewMemberList, createTeam, changeTeamProfile, changeTeamName, 
         addTeamMembers, deleteTeam, kickTeamMember, leaveTeam, changeTeamLeader} 
from "../controllers/teamControllers.js";

const router = express.Router({ mergeParams: true }); // mergeParams 추가

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.get("/", getTeam); // 팀 목록 조회

router.get("/:teamId", verifyTeam, viewTeam); //팀 정보 조회

router.get("/member-list", verifyClub, viewMemberList); //동아리 회원 목록 조회

router.post("/", createTeam); // 팀생성

router.patch("/:teamId/profile", verifyTeam, isTeamLeader, changeTeamProfile);

router.patch("/:teamId/name", verifyTeam, isTeamLeader, changeTeamName); //

router.patch("/:teamId/leader", verifyTeam, isTeamLeader, changeTeamLeader); // 팀장 변경

router.post("/:teamId/add-member", verifyTeam, isTeamLeader, addTeamMembers); // 팀원 추가

router.delete("/:teamId/delete", verifyTeam, isTeamLeader, deleteTeam); // 팀 삭제

router.delete("/:teamId/kick-member", verifyTeam, isUserJoinedTeam, isTeamLeader, kickTeamMember); // 팀원 삭제

router.delete("/:teamId/leave", verifyTeam, isMyTeam, leaveTeam); // 팀 탈퇴

export default router;
