import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";
import { s3Client } from "../config/s3config.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

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

// 사용자 프로필 사진 업데이트
export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      // 파일이 없는 경우, 기존 프로필 이미지 URL 유지
      const currentUser = await prisma.weBandUser.findUnique({
        where: { user_id: req.user.user_id },
      });

      if (!currentUser) {
        return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }

      return res.status(200).json({
        message: '이미지를 업로드하지 않아 기존 프로필 이미지를 유지합니다.',
        user: {
          ...currentUser,
          kakao_id: currentUser.kakao_id.toString(),
        },
      });
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const key = `profile/custom/${req.user.userID}/${req.user.userID}-${Date.now()}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: req.file.buffer, // Multer는 파일 데이터를 buffer로 제공
      ContentType: req.file.mimetype, // 파일의 MIME 타입
    });

    await s3Client.send(command);

    const profileImageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    const updatedUser = await prisma.weBandUser.update({
      where: { user_id: req.user.user_id },
      data: { profile_img: profileImageUrl },
    });

    res.status(200).json({
      message: '프로필 이미지가 성공적으로 업데이트되었습니다.',
      user: {
        ...updatedUser,
        kakao_id: updatedUser.kakao_id.toString(),
      }
    });
  } catch (error) {
    logger.error("프로필 이미지 변경 실패: ", error);
    return res.status(500).json({ message: "서버 오류로 프로필 이미지를 변경할 수 없습니다." });
  }
};

// 사용자 이름 변경 (닉네임)
export const updateUsername = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "새로운 닉네임을 입력해주세요." });
    }

    // 현재 사용자 조회
    const currentUser = await prisma.weBandUser.findUnique({
      where: { user_id: req.user.user_id },
    });

    if (!currentUser) {
      logger.warn(`닉네임 변경 실패 - 존재하지 않는 사용자: ${req.user.user_id}`);
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 닉네임 업데이트
    const updatedUser = await prisma.weBandUser.update({
      where: { user_id: req.user.user_id },
      data: { user_name: username },
    });

    logger.info(`닉네임 변경 성공: ${currentUser.email} -> ${username}`);

    return res.json({
      message: "닉네임이 성공적으로 변경되었습니다.",
      user: {
        id: updatedUser.user_id,
        email: updatedUser.email,
        user_name: updatedUser.user_name,
        profile_img: updatedUser.profile_img,
      }
    });
  } catch (error) {
    logger.error("사용자 닉네임 변경 실패: ", error);
    return res.status(500).json({ message: "서버 오류로 닉네임을 변경할 수 없습니다." });
  }
};