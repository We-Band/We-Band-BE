import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import {
  verifyClub,
  isLeader,
  isClubMember,
} from "../middlewares/clubMiddlewares.js";
import {
  joinClub,
  viewClub,
  quitClub,
  kickMember,
  changeCode,
  changeLeader,
  getMyClubs,
} from "../controllers/clubControllers.js";
import { get } from "http";

const router = express.Router();

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.post("/", joinClub); //동아리 가입

router.get("/:clubId", verifyClub, viewClub); //동아리 정보 조회

router.delete("/:clubId/leave", verifyClub, isClubMember, quitClub); //동아리 탈퇴

router.post(
  "/:clubId/kick-member",
  verifyClub,
  isLeader,
  isClubMember,
  kickMember
); //동아리 추방

router.patch("/:clubId/setting", verifyClub, isLeader, changeCode); //동아리 가입 코드 변경

router.patch("/:clubId/leader", verifyClub, isLeader, changeLeader); //동아리 회장 변경

router.get("/getclubs/:userId", getMyClubs); //내 동아리 조회

export default router;
