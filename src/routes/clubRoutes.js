import express from "express";
import { isJoinedClub, isUserJoinedClub, isLeader  } from "../middlewares/clubMiddlewares.js"; 
import { joinClub, quitClub, kickMember, changeCode, changeLeader } from "../controllers/clubControllers.js"; 

const router = express.Router();

router.post("/:clubId", isJoinedClub, joinClub);

router.delete("/:clubId", isJoinedClub, quitClub);

router.post("/:ClubId/kick", isLeader, isUserJoinedClub, kickMember);

router.post("/:clubId/setting", isLeader, changeCode);

router.patch("/:clubId/leader", isLeader, changeLeader);

export default router;