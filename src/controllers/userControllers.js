import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();

// 현재 사용자 정보 조회
export const getCurrentUser = async (req, res) => {
  try {
    // 현재 요청한 유저 정보 조회
    const currentUser = await prisma.weBandUser.findUnique({
      where: { user_id: req.user.user_id },
    });

    if (!currentUser) { // 현재 사용자가 없는 경우
      logger.error('현재 사용자를 찾을 수 없습니다.');
      return res.status(404).json({ message: '현재 사용자를 찾을 수 없습니다.' });
    }

    const serializedUser = {
      ...currentUser,
      kakao_id: currentUser.kakao_id.toString(),
    };

    // 사용자 정보 반환
    logger.info(`사용자 프로필 접근 성공: ${currentUser.email}`);
    res.status(200).json({
      message: '사용자 프로필 접근 성공',
      user: serializedUser,
    });
  } catch (err) {
    logger.error('getCurrentUser 오류: ' + err.message);
    res.status(500).json({ message: '사용자 정보를 가져오는 데 실패했습니다.' });
  }
};

// 회원가입 API (POST /user/signup)
// *** 카카오 로그인 사용시 사용X ***
// *** 혹시 몰라서 코드만 남겨뒀습니다 ***
export const signUpUser = async (req, res) => {
  try {
    const { kakao_id, user_name, email } = req.body;

    if (!kakao_id || !user_name || !email) {
      return res.status(400).json({ message: "필수 입력값이 없습니다." });
    }

    const newUser = await prisma.weBandUser.create({
      data: {
        kakao_id: BigInt(kakao_id),
        user_name,
        email,
      },
    });

    const responseUser = {
      ...newUser,
      kakao_id: newUser.kakao_id.toString(),
    };

    return res.status(201).json({
      message: "회원 가입이 완료되었습니다.",
      user: newUser,
    });
  } catch (error) {
    console.error("회원가입 실패", error);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};