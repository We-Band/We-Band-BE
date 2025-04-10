import express from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { verifyClub } from "../middlewares/clubMiddlewares.js";
import { verifyTeam, isTeamLeader } from "../middlewares/teamMiddlewares.js";
import {
  getTeam,
  viewTeam,
  viewMemberList,
  createTeam,
  changeTeamProfile,
  changeTeamName,
  addTeamMembers,
  deleteTeam,
  kickTeamMember,
  leaveTeam,
  changeTeamLeader,
} from "../controllers/team/teamControllers.js";

const router = express.Router({ mergeParams: true }); // mergeParams 추가

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // 업로드 허용
  } else {
    cb(new Error("이미지 파일만 업로드할 수 있습니다."), false); // 업로드 거부
  }
};

const upload = multer({
  storage: multer.memoryStorage(), // buffer로 받기 위해
  fileFilter,
  limits: { fileSize: 1024 * 1024 }, // 최대 1MB
});

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.get("/", getTeam); // 팀 목록 조회

router.get("/:teamId", verifyTeam, viewTeam); //팀 정보 조회

router.get("/member-list", verifyClub, viewMemberList); //동아리 회원 목록 조회

router.post("/", createTeam); // 팀생성

router.patch(
  "/:teamId/profile",
  verifyTeam,
  isTeamLeader,
  upload.single("profileImage"),
  changeTeamProfile
); // 팀 프로필 사진 변경

router.patch("/:teamId/name", verifyTeam, isTeamLeader, changeTeamName); // 팀 이름 변경

router.patch("/:teamId/leader", verifyTeam, isTeamLeader, changeTeamLeader); // 팀장 변경

router.post("/:teamId/add-member", verifyTeam, isTeamLeader, addTeamMembers); // 팀원 추가

router.delete("/:teamId/delete", verifyTeam, isTeamLeader, deleteTeam); // 팀 삭제

router.delete("/:teamId/kick-member", verifyTeam, isTeamLeader, kickTeamMember); // 팀원 삭제

router.delete("/:teamId/leave", verifyTeam, leaveTeam); // 팀 탈퇴

export default router;
