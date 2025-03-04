import express from "express";
import { isJoinedClub, isClubExist  } from "../middlewares/clubMiddlewares.js"; 
import { joinClub } from "../controllers/clubControllers.js"; 

const router = express.Router();

router.post("/:clubId/join", isJoinedClub, isClubExist, joinClub);

//router.delete("/:clubId/leave", isJoinedClub, isClubExist, withdrawClub);

export default router;