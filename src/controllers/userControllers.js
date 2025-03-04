import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 현재 사용자 정보 조회 (예시)
export const getCurrentUser = async (req, res, next) => {
  try {
  } catch (err) {}
};

// 회원가입 API (POST /user/signup)

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
