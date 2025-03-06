import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { isJoinedClub, isUserJoinedClub, isLeader  } from "../middlewares/clubMiddlewares.js"; 
import { joinClub, quitClub, kickMember, changeCode, changeLeader } from "../controllers/clubControllers.js"; 

const router = express.Router();

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.post("/", joinClub);

router.delete("/:clubId", isJoinedClub, quitClub);

router.delete("/:clubId/kick", isLeader, isUserJoinedClub, kickMember);

router.patch("/:clubId/setting", isLeader, changeCode);

router.patch("/:clubId/leader", isLeader, changeLeader);

export default router;