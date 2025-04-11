import { clubScheduleService } from "../services/clubScheduleService.js";
import { logger } from "../utils/logger.js";
import { clubScheduleDto } from "../dtos/clubScheduleDto.js";

export const viewClubSchedule = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { day } = req.query;

    const result = await clubScheduleService.getClubWeeklySchedule(clubId, day);
    logger.debug("동아리 주간 일정을 보냈습니다.");
    res.json(result);
  } catch (error) {
    logger.error(`동아리 일정 정보 조회 중 오류 발생: ${error.message}`, error);
    res
      .status(500)
      .json({ message: "동아리 정보 조회 중 오류가 발생했습니다." });
  }
};

export const viewDetailClubSchedule = async (req, res) => {
  try {
    const clubSchedule = req.clubSchedule;

    logger.debug(`동아리 일정 정보를 보냈습니다., `);
    res.json(clubSchedule);
  } catch (error) {
    logger.error(`동아리 일정 정보 조회 중 오류 발생: ${error.message}`, error);
    res
      .status(500)
      .json({ message: "동아리 일정 정보 조회 중 오류가 발생했습니다." });
  }
};

export const addClubSchedule = async (req, res) => {
  try {
    const { clubId } = req.params;
    const dto = new clubScheduleDto(req.body);

    const result = await clubScheduleService.createClubSchedule(clubId, dto);
    logger.debug("동아리 일정이 추가 됐습니다.");
    res.status(201).json(result);
  } catch (error) {
    logger.error("동아리 일정 추가 중 오류 발생:", error);
    res.status(500).json({ message: "동아리 일정 추가 중 오류 발생" });
  }
};

export const deleteClubSchedule = async (req, res) => {
  try {
    const { clubScheduleId } = req.params;

    await clubScheduleService.deleteClubSchedule(clubScheduleId);
    logger.debug("동아리 일정이 삭제 됐습니다.");
    res.status(200).json({ message: "동아리 일정이 삭제되었습니다." });
  } catch (error) {
    logger.error("동아리 일정 삭제 중 오류 발생:", error);
    res.status(500).json({ message: "동아리 일정 삭제 중 오류 발생" });
  }
};

export const updateClubSchedule = async (req, res) => {
  try {
    const { clubId, clubScheduleId } = req.params;
    const dto = new clubScheduleDto(req.body);

    const result = await clubScheduleService.updateClubSchedule(
      clubScheduleId,
      dto
    );
    logger.debug("동아리 일정이 수정되었습니다.");
    res.status(200).json(result);
  } catch (error) {
    logger.error("동아리 일정 수정 중 오류 발생:", error);
    res.status(500).json({ message: "동아리 일정 수정 중 오류 발생" });
  }
};
