import express from "express";
import { logger } from "../utils/logger.js";
import { signUpUser } from "../controllers/userControllers.js";

const router = express.Router();

router.get("/", async (req, res) => {
  res.status(200).json({ message: "테스트 라우트" });
  logger.info("테스트 라우트");
});

router.post("/signup", signUpUser);

export default router;
