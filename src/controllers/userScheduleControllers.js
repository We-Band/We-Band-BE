import { userScheduleService } from "../services/userScheduleService.js";
import { userScheduleDto } from "../dtos/userScheduleDto.js";
import { logger } from "../utils/logger.js";

export const viewUserSchedule = async (req, res) => {
  try {
    const { userId } = req.params;
    const { day } = req.query;
    const myId = req.user.user_id;

    const result = await userScheduleService.fetchWeeklyUserSchedule(
      myId,
      userId,
      day
    );
    logger.debug("사용자 주간 일정을 보냈습니다.");
    return res.json(result);
  } catch (error) {
    logger.error(`사용자 주간 일정 조회 실패: ${error.message}`, { error });
    return res
      .status(500)
      .json({ message: "사용자 주간 일정 조회 중 오류가 발생했습니다." });
  }
};

export const viewDetailUserSchedule = async (req, res) => {
  try {
    const userSchedule = req.userSchedule;

    const userScheduleDetail =
      await userScheduleService.fetchUserScheduleDetail(userSchedule);

    logger.debug("사용자 일정 정보 조회 성공");
    return res.json(userScheduleDetail);
  } catch (error) {
    logger.error(`사용자 일정 정보 조회 실패: ${error.message}`, { error });
    return res
      .status(500)
      .json({ message: "사용자 일정 조회 중 오류가 발생했습니다." });
  }
};

export const addUserSchedule = async (req, res) => {
  try {
    const { userId } = req.params;
    const dto = new userScheduleDto(req.body);

    const result = await userScheduleService.addUserSchedule(userId, dto);

    logger.debug("사용자 일정 추가 성공");
    return res.status(201).json(result);
  } catch (error) {
    logger.error(`사용자 일정 추가 실패: ${error.message}`, { error });
    return res
      .status(500)
      .json({ message: "사용자 주간 일정 추가 중 오류가 발생했습니다." });
  }
};

export const updateUserSchedule = async (req, res) => {
  try {
    const { userScheduleId } = req.params;
    const dto = new userScheduleDto(req.body);

    const result = await userScheduleService.updateUserSchedule(
      userScheduleId,
      dto
    );

    logger.info("사용자 일정 수정 성공");
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`사용자 일정 수정 실패: ${error.message}`, { error });
    return res
      .status(500)
      .json({ message: "사용자 일정 수정 중 오류가 발생했습니다." });
  }
};

export const deleteUserSchedule = async (req, res) => {
  try {
    const { userScheduleId } = req.params;
    await userScheduleService.deleteUserSchedule(userScheduleId);

    logger.debug("사용자 일정 삭제 성공");
    return res.status(200).json({ message: "일정 삭제 성공" });
  } catch (error) {
    logger.error(`사용자 일정 삭제 실패: ${error.message}`, { error });
    return res
      .status(500)
      .json({ message: "사용자 일정 삭제 중 오류가 발생했습니다." });
  }
};
