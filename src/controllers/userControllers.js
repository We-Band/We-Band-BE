import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 현재 사용자 정보 조회
export const getCurrentUser = async (req, res) => {
  try {
    // 현재 요청한 유저 정보 조회
    const currentUser = await prisma.weBandUser.findUnique({
      where: { user_id: req.user.user_id },
    });

    if (!currentUser) { // 현재 사용자가 없는 경우
      return res.status(404).json({ message: '현재 사용자를 찾을 수 없습니다.' });
    }

    const serializedUser = {
      ...currentUser,
      kakao_id: currentUser.kakao_id.toString(),
    };

    // 사용자 정보 반환
    res.status(200).json({
      message: '사용자 프로필 접근 성공',
      user: serializedUser,
    });
  } catch (err) {
    console.error('getCurrentUser 오류:', err.message);
    res.status(500).json({ message: '사용자 정보를 가져오는 데 실패했습니다.' });
  }
};