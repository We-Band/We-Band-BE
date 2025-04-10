import {
  getUserById,
  updateProfileImgById,
  updateUsernameById,
} from "../repositories/userRepository.js";
import { serializeUserDto } from "../dto/userDto.js";
import { s3Client } from "../config/s3config.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { logger } from "../utils/logger.js";

const bucketName = process.env.R2_BUCKET_NAME;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

export const getUserService = async (userId) => {
  try {
    const user = await getUserById(userId);
    if (!user) {
      logger.error("현재 사용자를 찾을 수 없습니다.");
      return {
        status: 404,
        body: { message: "현재 사용자를 찾을 수 없습니다." },
      };
    }
    logger.info(`사용자 프로필 접근 성공: ${user.email}`);
    return {
      status: 200,
      body: {
        message: "사용자 프로필 접근 성공",
        user: serializeUserDto(user),
      },
    };
  } catch (err) {
    logger.error("getCurrentUser 오류: " + err.message);
    return {
      status: 500,
      body: { message: "사용자 정보를 가져오는 데 실패했습니다." },
    };
  }
};

export const updateImageService = async (user, file) => {
  try {
    const currentUser = await getUserById(user.user_id);
    if (!currentUser)
      return { status: 404, body: { message: "사용자를 찾을 수 없습니다." } };

    if (!file) {
      return {
        status: 200,
        body: {
          message: "이미지를 업로드하지 않아 기존 프로필 이미지를 유지합니다.",
          user: serializeUserDto(currentUser),
        },
      };
    }

    const extractKeyFromUrl = (url) => new URL(url).pathname.slice(1);

    if (currentUser.profile_img) {
      const oldKey = extractKeyFromUrl(currentUser.profile_img);
      await s3Client.send(
        new DeleteObjectCommand({ Bucket: bucketName, Key: oldKey })
      );
    }

    const key = `profile/custom/${user.userID}/${user.userID}-${Date.now()}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const newImageUrl = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;
    const updatedUser = await updateProfileImgById(user.user_id, newImageUrl);

    return {
      status: 200,
      body: {
        message: "프로필 이미지가 성공적으로 업데이트되었습니다.",
        user: serializeUserDto(updatedUser),
      },
    };
  } catch (error) {
    logger.error("프로필 이미지 변경 실패: ", error);
    return {
      status: 500,
      body: { message: "서버 오류로 프로필 이미지를 변경할 수 없습니다." },
    };
  }
};

export const updateNameService = async (userId, username) => {
  try {
    if (!username)
      return {
        status: 400,
        body: { message: "새로운 닉네임을 입력해주세요." },
      };
    const currentUser = await getUserById(userId);
    if (!currentUser) {
      logger.warn(`닉네임 변경 실패 - 존재하지 않는 사용자: ${userId}`);
      return { status: 404, body: { message: "사용자를 찾을 수 없습니다." } };
    }
    const updatedUser = await updateUsernameById(userId, username);
    logger.info(`닉네임 변경 성공: ${currentUser.email} -> ${username}`);
    return {
      status: 200,
      body: {
        message: "닉네임이 성공적으로 변경되었습니다.",
        user: {
          id: updatedUser.user_id,
          email: updatedUser.email,
          user_name: updatedUser.user_name,
          profile_img: updatedUser.profile_img,
        },
      },
    };
  } catch (error) {
    logger.error("사용자 닉네임 변경 실패: ", error);
    return {
      status: 500,
      body: { message: "서버 오류로 닉네임을 변경할 수 없습니다." },
    };
  }
};
