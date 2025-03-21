import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();

// JWT 액세스 토큰 생성
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.user_id,
      email: user.email,
      kakaoID: user.kakao_id.toString(),
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
  );
};

// JWT 리프래시 토큰 생성
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.user_id,
      email: user.email,
      kakaoID: user.kakao_id.toString(),
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
  );
};

// JWT 액세스 토큰 갱신
export const refreshAccessToken = async (req) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new Error("Refresh Token이 필요합니다.");
    }
    // 리프래시 토큰 검증
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.weBandUser.findUnique({
      where: { user_id: decoded.userId },
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    // 새로운 액세스 토큰 발급
    const newAccessToken = generateAccessToken(user);
    logger.info(
      `Refresh Token 검증 성공 - 새로운 Access Token 발급: ${user.email}`
    );
    return newAccessToken;
  } catch (err) {
    logger.error("Refresh Token 검증 실패: " + err.message);
    throw new Error("유효하지 않은 Refresh Token입니다.");
  }
};
