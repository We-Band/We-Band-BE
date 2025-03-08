import express from "express";
import multer from "multer";
import { getCurrentUser, updateProfileImage, updateUsername } from "../controllers/userControllers.js";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { } from "../controllers/userControllers.js";

const router = express.Router();
const upload = multer();

router.use(authMiddleware); // 인증 미들웨어 적용 (jwt 토큰)

router.get("/", getCurrentUser);
router.patch("/profile-image", upload.single('profileImage'), updateProfileImage); // 사용자 프로필 이미지 변경
router.patch("/username", updateUsername); // 사용자 이름 변경 (닉네임)

export default router;
