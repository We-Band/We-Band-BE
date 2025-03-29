import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { verifyClub, isMyClub, isUserJoinedClub, isLeader  } from "../middlewares/clubMiddlewares.js"; 
import { joinClub, viewClub, quitClub, kickMember, changeCode, changeLeader } from "../controllers/clubControllers.js"; 

const router = express.Router();

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)


router.post("/", joinClub); //동아리 가입

router.get("/", verifyClub, viewClub); //동아리 정보 조회

router.get("/:clubId", viewClub); 

router.delete("/:clubId", verifyClub, isMyClub, quitClub);

router.delete("/:clubId/kick", verifyClub, isLeader, isUserJoinedClub, kickMember);

router.patch("/:clubId/setting", verifyClub, isLeader, changeCode);

router.patch("/:clubId/leader", verifyClub, isLeader, changeLeader);

export default router;