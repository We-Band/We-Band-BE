import { PrismaClient } from "@prisma/client";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/jwtServices.js";
import axios from "axios";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();

// 카카오 로그인 페이지로 리디렉션 (프론트에서 하는 작업) (테스트용)
export const redirectToKakaoLogin = (req, res) => {
  // 추후에 동적으로 REDIRECT_URI 설정 필요할 수 있음
  const redirectUri = process.env.REDIRECT_URI;
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.REST_API_KEY}&redirect_uri=${redirectUri}`;
  res.redirect(kakaoAuthUrl); // 사용자 브라우저를 카카오 로그인 페이지로 리디렉션
};

// 인가 코드 콜백 처리 (프론트에서 하는 작업) (테스트용)
export const handleKakaoCallback = (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send("Authorization code not provided");
  }
  // 받은 인가 코드를 클라이언트로 반환하거나 액세스 토큰 요청으로 연결
  res.json({ authorization_code: code });
};

// 카카오 로그인 (인가 코드 to 카카오 액세스토큰 발급)
export const kakaoLogin = async (req, res) => {
  try {
    const { code } = req.body; // 클라이언트에서 받은 인가 코드

    const redirectUri = process.env.REDIRECT_URI;

    const response = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: process.env.REST_API_KEY,
          redirect_uri: redirectUri,
          code: code,
        },
      }
    );

    const {
      token_type,
      access_token,
      expires_in,
      refresh_token,
      refresh_token_expires_in,
      scope,
    } = response.data;

    res.json({
      token_type,
      access_token,
      expires_in,
      refresh_token,
      refresh_token_expires_in,
      scope,
    }); // 클라이언트로 카카오 액세스 토큰, 리프래쉬 토큰 반환
  } catch (error) {
    logger.error(
      "카카오 액세스 토큰 요청 실패: " + (error.response?.data || error.message)
    );
    res.status(500).send("Token request failed");
  }
};

// 카카오 사용자 정보 가져오기
export const getKakaoUser = async (accessToken) => {
  try {
    // 액세스 토큰을 사용하여 카카오 사용자 정보를 가져옴
    const response = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data; // 사용자 정보 반환
  } catch (error) {
    logger.error(
      "카카오 사용자 정보 요청 실패:",
      error.response?.data || error.message
    );
    throw new Error("Failed to retrieve user info");
  }
};

// 카카오 사용자 처리 (데이터베이스 저장/조회) + (JWT 토큰 발급)
export const handleKakaoUser = async (req, res) => {
  try {
    const { kakaoAccessToken } = req.body; // 클라이언트에서 받은 액세스 토큰

    // 카카오 사용자 정보 가져오기
    const userInfo = await getKakaoUser(kakaoAccessToken);

    const { id: kakaoId, kakao_account, properties } = userInfo; // 카카오 사용자 ID 및 계정 정보
    const email = kakao_account.email;
    const userName = properties.nickname || email.split("@")[0];
    const profile_img = properties.profile_image || null;

    // 데이터베이스에서 사용자 확인 또는 새 사용자 생성
    let user = await prisma.weBandUser.findUnique({ where: { email } });

    if (!user) {
      // 새 사용자 생성
      user = await prisma.weBandUser.create({
        data: {
          kakao_id: BigInt(kakaoId),
          email,
          user_name: userName,
          profile_img:
            "https://we-band.534b5de33d3d2ad79d00087224cf4d73.r2.cloudflarestorage.com/default-profile/1744607107947",
        },
      });
      logger.info(`새로운 사용자 생성: ${email}`);
    } else {
      logger.info(`기존 사용자 로그인: ${email}`);
    }

    // JWT 토큰 생성
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Refresh Token을 HttpOnly 쿠키에 저장
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    // 사용자 정보 + JWT 토큰 반환
    res.json({
      user: {
        id: user.user_id,
        kakao_id: user.kakao_id.toString(),
        email: user.email,
        user_name: user.user_name,
        profile_img: user.profile_img,
      },
      accessToken,
    });
  } catch (error) {
    logger.error("사용자 처리 실패: " + error.message);
    res.status(500).send("Failed to process user");
  }
};

//로그아웃
export const logout = async (req, res) => {
  try {
    if (!req.user) {
      logger.debug("로그인 상태가 아닙니다");
      return res.status(400).json({ message: "로그인 상태가 아닙니다." });
    } //쿠키 정보로 로그인 상태 확인

    //쿠키 파쇄
    res.cookie("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "dev",
      sameSite: "None",
      expires: new Date(0),
    });

    logger.debug("로그아웃 되었습니다.");
    res.status(200).json({ message: "로그아웃 성공" });
  } catch (error) {
    logger.error(`로그아웃 실패:  + ${error.message}`, error);
    res.status(500).json({ message: "로그아웃 실패" });
  }
};

export const withdraw = async (req, res) => {
  try {
    const userId = req.user.user_id;

    if (!req.user) {
      logger.debug("로그인 상태가 아닙니다");
      return res.status(400).json({ message: "로그인 상태가 아닙니다." });
    }

    //사용자 삭제(hard-delete) 프론트에서 검증로직 추가 필요
    await prisma.weBandUser.delete({
      where: {
        user_id: userId,
      },
    });

    logger.info(`회원이 탈퇴 했습니다, ${userId}`);
    res.status(200).json({ message: "회원 탈퇴 성공했습니다." });
  } catch (error) {
    logger.error(`회원 탈퇴 실패 :  + ${error.message}`, error);
    res.status(500).json({ message: "회원 탈퇴 실패" });
  }
};
