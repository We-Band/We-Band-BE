import express from "express";
import { isJoinedClub } from "../middlewares/clubMiddleware.js"; 
import { joinClub, isClubExist } from "../controllers/clubController.js"; 

const router = express.Router();

router.post("/clubs/:clubId/join", isJoinedClub, isClubExist, joinClub);

export default router;