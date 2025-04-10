import { userService } from "../services/userService.js";
import { logger } from "../utils/logger.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const user = await userService.getCurrentUser(userId);

    logger.info(`사용자 프로필 접근 성공: ${user.email}`);
    res.status(200).json({
      message: "사용자 프로필 접근 성공",
      user,
    });
  } catch (err) {
    logger.error("getCurrentUser 오류: " + err.message);
    res
      .status(500)
      .json({ message: "사용자 정보를 가져오는 데 실패했습니다." });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { file } = req.file;

    const updatedUser = await userService.updateProfileImage(userId, file);

    logger.debug("사용자 프로필 이미지가 성공적으로 업데이트 됐습니다.");
    res.status(200).json({
      message: "프로필 이미지가 성공적으로 업데이트되었습니다.",
      user: updatedUser,
    });
  } catch (error) {
    logger.error(`프로필 이미지 변경 실패: ${error}`, error);
    return res
      .status(500)
      .json({ message: "서버 오류로 프로필 이미지를 변경할 수 없습니다." });
  }
};

export const updateUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.user_id;

    const updatedUser = await userService.updateUsername(userId, username);

    logger.debug("사용자 이름이 변경되었습니다.");
    res.status(200).json({
      message: "닉네임이 성공적으로 변경되었습니다.",
      user: updatedUser,
    });
  } catch (error) {
    logger.error(`사용자 닉네임 변경 실패: ${error}`, error);
    return res
      .status(500)
      .json({ message: "서버 오류로 닉네임을 변경할 수 없습니다." });
  }
};
