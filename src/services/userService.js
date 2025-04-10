import { userRepository } from "../repositories/userRepository.js";
import { s3Client } from "../config/s3config.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { logger } from "../utils/logger.js";

export const userService = {
  getCurrentUser: async (userId) => {
    const user = await userRepository.getUserById(userId);
    if (!user)
      throw { status: 404, message: "현재 사용자를 찾을 수 없습니다." };
    return {
      ...user,
      kakao_id: user.kakao_id.toString(),
    };
  },

  updateProfileImage: async (userId, file) => {
    const bucketName = process.env.R2_BUCKET_NAME;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

    const extractKeyFromUrl = (url) => {
      const urlObj = new URL(url);
      return urlObj.pathname.slice(1);
    };

    const deleteFromR2 = async (key) => {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      await s3Client.send(command);
    };

    const currentUser = await userRepository.getUserById(userId);
    if (!currentUser) {
      logger.debug("사용자 조회 실패");
      throw { status: 404, message: "사용자를 찾을 수 없습니다." };
    }

    if (!file) {
      logger.debuf("파일이 누락 되었습니다");
      return {
        ...currentUser,
        kakao_id: currentUser.kakao_id.toString(),
      };
    }

    if (currentUser.profile_img) {
      const oldKey = extractKeyFromUrl(currentUser.profile_img);
      await deleteFromR2(oldKey);
    }

    const key = `profile/custom/${userId}/${userId}-${Date.now()}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);
    logger.debug("사진 버킷에 저장 성공");

    const profileImageUrl = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;
    const updatedUser = await userRepository.updateProfileImgById(
      userId,
      profileImageUrl
    );

    return {
      ...updatedUser,
      kakao_id: updatedUser.kakao_id.toString(),
    };
  },

  updateUsername: async (userId, username) => {
    if (!username) {
      throw { status: 400, message: "새로운 닉네임을 입력해주세요." };
    }
    const currentUser = await userRepository.getUserById(userId);
    if (!currentUser) {
      throw { status: 404, message: "사용자를 찾을 수 없습니다." };
    }

    const updatedUser = await userRepository.updateUsernameById(
      userId,
      username
    );
    return {
      id: updatedUser.user_id,
      email: updatedUser.email,
      user_name: updatedUser.user_name,
      profile_img: updatedUser.profile_img,
    };
  },
};
