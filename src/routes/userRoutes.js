import express from "express";
import { logger } from "../utils/logger.js";
import { getCurrentUser } from "../controllers/userControllers.js";
import { authMiddleware } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.get("/", getCurrentUser);
router.get("/test", async (req, res) => {
  res.status(200).json({ message: "테스트 라우트" });
  logger.info("테스트 라우트");
});

export default router;
