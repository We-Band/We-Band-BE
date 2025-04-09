import express from "express";
import multer from "multer";
import {
  getCurrentUser,
  updateProfileImage,
  updateUsername,
} from "../controllers/user/userControllers.js";
import { authMiddleware } from "../middlewares/authMiddlewares.js";

const router = express.Router();

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

router.get("/", getCurrentUser); // 사용자 정보 조회

router.patch(
  "/profile-image",
  upload.single("profileImage"),
  updateProfileImage
); // 사용자 프로필 이미지 변경

router.patch("/username", updateUsername); // 사용자 이름 변경 (닉네임)

export default router;
