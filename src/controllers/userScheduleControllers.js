import {
  fetchWeeklyUserSchedule,
  fetchUserScheduleDetail,
  addUserScheduleService,
  updateUserScheduleService,
  deleteUserScheduleService,
} from "../services/userScheduleService.js";
import {
  CreateUserScheduleDto,
  UpdateUserScheduleDto,
} from "../dtos/userScheduleDto.js";
import { logger } from "../utils/logger.js";

export const viewUserSchedule = async (req, res) => {
  try {
    const { userId } = req.params;
    const { day } = req.query;
    const myId = req.user.user_id;

    const result = await fetchWeeklyUserSchedule(myId, userId, day);
    logger.debug("사용자 주간 일정을 보냈습니다.");
    return res.json(result);
  } catch (err) {
    logger.error("사용자 일정 조회 실패:", err);
    return res.status(500).json({ message: "사용자 일정 조회 실패" });
  }
};

export const viewDetailUserSchedule = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user.user_id;
    const userSchedule = req.userSchedule;

    const result = await fetchUserScheduleDetail(myId, userId, userSchedule);
    return res.json(result);
  } catch (err) {
    logger.error("사용자 일정 상세 조회 실패:", err);
    return res.status(400).json({ message: "일정 상세 조회 실패" });
  }
};

export const addUserSchedule = async (req, res) => {
  try {
    const { userId } = req.params;
    const dto = new CreateUserScheduleDto(req.body);

    const result = await addUserScheduleService(userId, dto);
    return res.status(201).json(result);
  } catch (err) {
    logger.error("사용자 일정 추가 실패:", err);
    return res.status(500).json({ message: "일정 추가 실패" });
  }
};

export const modifyUserSchedule = async (req, res) => {
  try {
    const { userScheduleId } = req.params;
    const dto = new UpdateUserScheduleDto(req.body);

    const result = await updateUserScheduleService(userScheduleId, dto);
    return res.status(200).json(result);
  } catch (err) {
    logger.error("사용자 일정 수정 실패:", err);
    return res.status(500).json({ message: "일정 수정 실패" });
  }
};

export const deleteUserSchedule = async (req, res) => {
  try {
    const { userScheduleId } = req.params;
    await deleteUserScheduleService(userScheduleId);
    return res.status(200).json({ message: "일정 삭제 성공" });
  } catch (err) {
    logger.error("사용자 일정 삭제 실패:", err);
    return res.status(500).json({ message: "일정 삭제 실패" });
  }
};
