import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";
import { teamScheduleRepository } from "../repositories/teamScheduleRepository.js";
export const prisma = new PrismaClient();

// 팀 일정 존재 여부 검증 미들웨어
export const verifyTeamSchedule = async (req, res, next) => {
  try {
    const { clubId, teamId, teamScheduleId } = req.params;

    const teamSchedule = await teamScheduleRepository.getTeamScheduleById(
      teamScheduleId
    );
    if (!teamSchedule) {
      logger.debug("존재하지 않는 동아리 일정");
      return res
        .status(404)
        .json({ message: "동아리 일정을 찾을 수 없습니다." });
    }

    req.teamSchedule = teamSchedule;
    next();
  } catch (error) {
    logger.error(`팀 일정 존재 여부 검증 실패: ${error.message}`, { error });
    return res
      .status(500)
      .json({ message: "팀 일정 존재 여부 검증 중 오류 발생" });
  }
};

// 팀 멤버 검증 미들웨어
export const isTeamMember = async (req, res, next) => {
  try {
    const { clubId, teamId } = req.params;
    const userId = req.user.user_id;

    const isTeamMember = await prisma.teamMember.findFirst({
      where: {
        team_id: Number(teamId),
        user_id: Number(userId),
      },
    });

    if (!isTeamMember) {
      logger.debug("팀 멤버가 아닙니다.");
      return res
        .status(403)
        .json({ message: "해당 기능에 접근할 권한이 없습니다. " });
    }

    logger.debug("팀 멤버 여부 검증 완료");
    next();
  } catch (error) {
    logger.error(`팀 멤버 여부 검증 실패: ${error.message}`, { error });
    return res.status(500).json({ message: "팀 멤버 여부 검증 중 오류 발생" });
  }
};

// 팀 일정 정보 누락 검증 미들웨어
export const isMissingTeamSchedule = async (req, res, next) => {
  try {
    const { teamScheduleStart, teamScheduleEnd, teamScheduleTitle } = req.body;

    //일정 시간, 제목은 필수로 들어가야함
    if (!teamScheduleStart && !teamScheduleEnd) {
      logger.debug("팀 일정 시간 누락");
      return res
        .status(400)
        .json({ message: "팀 일정 시간이 누락되었습니다." });
    }

    if (!teamScheduleTitle) {
      logger.debug("팀 일정 제목 누락");
      return res
        .status(400)
        .json({ message: "팀 일정 제목이 누락되었습니다." });
    }
    next();
  } catch (error) {
    logger.error(`팀 일정 누락 검증 실패: ${error.message}`, { error });
    return res.status(500).json({ message: "팀 일정 누락 검증 중 오류 발생" });
  }
};

// 팀 일정 중복 검증 미들웨어
export const isConflictSchedule = async (req, res, next) => {
  try {
    const { clubId, teamId, teamScheduleId } = req.params;
    const { teamScheduleStart, teamScheduleEnd } = req.body;

    const startDate = new Date(teamScheduleStart);
    const endDate = new Date(teamScheduleEnd);

    // clubScheduleStart 날짜의 시작(자정)과 끝(23:59:59) 계산 (하루 단위)
    const startOfDay = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      0,
      0,
      0
    );
    const endOfDay = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      23,
      59,
      59
    );

    // 해당 날에 속하면서, 지정한 시간 범위와 겹치는 일정 검색
    const conflictSchedule = await prisma.teamSchedule.findFirst({
      where: {
        team_id: Number(teamId),
        AND: [
          { team_schedule_start: { gte: startOfDay, lt: endOfDay } },
          { team_schedule_end: { gt: startDate } },
          { team_schedule_start: { lt: endDate } },
        ],
      },
    });

    if (conflictSchedule) {
      logger.debug("이 시간대에는 이미 일정이 존재합니다.");
      return res
        .status(400)
        .json({ message: "이 시간대에는 이미 일정이 존재합니다." });
    }
    next();
  } catch (error) {
    logger.error(
      `동아리 일정 중복 검증 과정 중 실패: ${error.message}, { error }`
    );
    return res
      .status(500)
      .json({ message: "동아리 일정 중복 검증 과정 중 오류 발생" });
  }
};
