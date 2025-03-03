import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 사용자 인증 미들웨어 (JWT 토큰)
export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Token이 필요합니다.' });
  }

  try {
    // Access Token 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 데이터베이스에서 사용자 확인
    const user = await prisma.weBandUser.findUnique({
      where: { user_id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 사용자 정보를 요청 객체에 추가
    req.user = { 
      user_id: user.user_id,
      kakao_id: user.kakao_id.toString(), // BigInt -> 문자열 변환
      email: user.email,
      user_name: user.user_name,
      profile_img: user.profile_img,
    };

    next(); // 다음 미들웨어로 전달
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      // Access Token이 만료된 경우, Refresh Token을 사용하여 갱신
      try {
        const newAccessToken = await refreshAccessToken(req);
        // 새 액세스 토큰을 헤더에 설정하고 사용자 정보를 유지합니다.
        req.headers.authorization = `Bearer ${newAccessToken}`;
        
        // 새 액세스 토큰으로 디코딩하여 사용자 정보를 가져옵니다.
        const decoded = jwt.verify(newAccessToken, process.env.JWT_SECRET);
        // 데이터베이스에서 사용자 확인
        const user = await prisma.weBandUser.findUnique({
          where: { user_id: decoded.userId },
        });

        if (!user) {
          return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        // 새 Access Token을 요청 객체에 반영
        req.headers.authorization = `Bearer ${newAccessToken}`;
        req.user = {
          user_id: user.user_id,
          kakao_id: user.kakao_id.toString(), // BigInt -> 문자열 변환
          email: user.email,
          user_name: user.user_name,
          profile_img: user.profile_img,
        };

        // 새 Access Token을 응답 헤더로 전달
        res.setHeader('x-access-token', newAccessToken);

        next(); // 다음 미들웨어로 전달
      } catch (refreshErr) {
        return res.status(401).json({ message: '새로운 Access Token 발급 실패' });
      }
    } else {
      return res.status(401).json({ message: '유효하지 않은 Access Token입니다.' });
    }
  }
};