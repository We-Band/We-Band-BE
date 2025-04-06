import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();

//내 일정인지 검증 미들웨어
export const isMine = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const myId = req.user.user_id;

    //접속한 일정이 내 일정하고 같은지 확인
    if (Number(userId) !== myId) {
      logger.info(`해당 기능에 접근할 수 없습니다, approached user: ${myId}`);
      return res
        .status(401)
        .json({ message: "해당 기능에 접근할 권한이 없습니다." });
    }

    logger.info(`사용자 일정 검증 완료", certified user: ${myId}`);
    next();
  } catch (error) {
    logger.error(`사용자 일정 검증 과정 중 실패: ${error.message}`, { error });
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};

// 사용자 일정 존재 여부 검증 미들웨어
export const verifyUserSchedule = async (req, res, next) => {
  try {
    const { userId, userScheduleId } = req.params;

    const userSchedule = await prisma.userSchedule.findUnique({
      where: {
        user_schedule_id: Number(userScheduleId),
      },
    });

    if (!userSchedule) {
      logger.info("사용자 일정이 존재하지 않음", { userScheduleId });
      return res
        .status(404)
        .json({ message: "사용자 일정을 찾을 수 없습니다." });
    }

    req.userSchedule = userSchedule;
    next();
  } catch (errror) {
    logger.error(`사용자 일정 존재 여부 검증 실패: ${error.message}`, {
      error,
    });
    return res
      .status(500)
      .json({ message: "사용자 일정 존재 여부 검증 중 오류 발생" });
  }
};

// 사용자 일정 누락 정보 검증 미들웨어
export const isMissingUserSchedule = async (req, res, next) => {
  try {
    const { userScheduleStart, userScheduleEnd, userScheduleTitle } = req.body;

    //일정 시간, 제목은 필수로 들어가야함
    if (!userScheduleStart && !userScheduleEnd) {
      logger.debug("사용자 일정 시간 누락");
      return res
        .status(400)
        .json({ message: "동아리 일정 시간을 입력하세요." });
    }

    if (!userScheduleTitle) {
      logger.debug("사용자 일정 제목 누락");
      return res
        .status(400)
        .json({ message: "동아리 일정 제목을 입력하세요." });
    }
    next();
  } catch (error) {
    logger.error(`사용자 일정 누락 검증 실패: ${error.message}, { error }`);
    return res
      .status(500)
      .json({ message: "사용자 일정 누락 검증 중 오류 발생" });
  }
};

// 사용자 일정 중복 검증 미들웨어
export const isConflictUserSchedule = async (req, res, next) => {
  try {
    const { userId, userScheduleId } = req.params;
    const { userScheduleStart, userScheduleEnd } = req.body;

    const startDate = new Date(userScheduleStart);
    const endDate = new Date(userScheduleEnd);

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
    const conflictSchedule = await prisma.userSchedule.findFirst({
      where: {
        user_id: Number(userId),
        AND: [
          { user_schedule_start: { gte: startOfDay, lt: endOfDay } },
          { user_schedule_end: { gt: startDate } },
          { user_schedule_start: { lt: endDate } },
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
      `사용자 일정 중복 검증 과정 중 실패: ${error.message}, { error }`
    );
    return res
      .status(500)
      .json({ message: "사용자 일정 중복 검증 과정 중 오류 발생" });
  }
};
