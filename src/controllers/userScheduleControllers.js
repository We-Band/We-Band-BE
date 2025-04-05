import express from "express";
import { logger } from "../utils/logger.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();

export const prisma = new PrismaClient();

//(GET /userss/:userId/userSchedules?day=2025-03-10)
export const viewUserSchedule = async (req, res) => {
  try {
    const { userId } = req.params;
    const { day } = req.query;

    //날짜를 주 단위로 요청
    const inputDate = new Date(day);
    const dayOfWeek = inputDate.getDay();
    const startDate = new Date(inputDate);
    startDate.setDate(
      inputDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    ); // 월요일 찾기
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    //clubSchedules에 보낼 정보 선택
    const userSchedules = await prisma.userSchedule.findMany({
      where: {
        user_id: Number(userId),
        user_schedule_start: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        user_schedule_id: true,
        user_schedule_start: true,
        user_schedule_end: true,
        user_schedule_title: true,
        is_public: true,
      },
      orderBy: {
        user_schedule_start: "asc",
      },
    });

    let timeData = Array(210).fill(0);
    let events = [];

    for (let schedule of userSchedules) {
      const {
        user_schedule_id,
        user_schedule_start,
        user_schedule_end,
        user_schedule_title,
        is_public,
      } = schedule;

      if (Number(userId) !== Number(myId) && is_public) {
        user_schedule_id = -1;
        user_schedule_title = "비공개 일정";
      }

      const startIdx = Math.floor(
        (user_schedule_start - startDate) / (30 * 60 * 1000)
      ); // 30분 단위 인덱스
      const length = Math.floor(
        (user_schedule_end - user_schedule_start) / (30 * 60 * 1000)
      );

      //해당 시간대에 일정이 있으면 1로 표시
      for (let i = startIdx; i < startIdx + length; i++) {
        timeData[i] = 1;
      }

      //events 배열에 시작인덱스, 인덱스길이, club_schedule_id, club_schedule_title 추가
      events.push([startIdx, length, user_schedule_id, user_schedule_title]);
    }

    //0과 1 -> 1바이트로 변환
    const packedTimeData = [];
    for (let i = 0; i < timeData.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8; j++) {
        if (i + j < timeData.length) {
          byte |= timeData[i + j] << (7 - j);
        }
      }
      packedTimeData.push(byte);
    }

    //base64인코딩
    const timeField = Buffer.from(packedTimeData).toString("base64");

    logger.debug("사용자 주간 일정을 보냈습니다.");
    return res.json({
      timeData: timeField,
      events,
    });
  } catch (error) {
    logger.error(`사용자 일정 정보 조회 중 오류 발생: ${error.message}`, error);
    return res
      .status(500)
      .json({ message: "사용자 정보 조회 중 오류가 발생했습니다." });
  }
};

//사용자 일정 정보 조회 API (GET /user/:userId/userSchedule/:userScheduleId)
export const viewDetailUserSchedule = async (req, res) => {
  try {
    const { userId, userScheduleId } = req.params;
    const myId = req.userId;
    const userSchedule = req.userSchedule;

    const {
      user_schedule_start,
      user_schedule_end,
      user_schedule_title,
      user_schedule_place,
      user_schedule_participants,
      is_public,
    } = userSchedule;

    // 응답으로 필요한 필드만 보냄
    const result = {
      user_schedule_start,
      user_schedule_end,
      user_schedule_title,
      user_schedule_place,
      user_schedule_participants,
      is_public,
    };

    //비공개 일정시 자세한 내용 숨기기(시간대만 알 수 있음)
    if (Number(userId) !== Number(myId) && is_public) {
      user_schedule_title = "비공개 일정";
      user_schedule_place = "";
      user_schedule_participants = "비공개 일정";
    }

    logger.debug(`사용자 일정 정보를 보냈습니다., ${userScheduleId}`);
    return res.json(result);
  } catch (error) {
    logger.error(`사용자 일정 조회 중 오류가 발생했습니다. ${error.message}`, {
      error,
    });
    return res.status(400).json({ message: "사용자 일정 조회 중 오류 발생" });
  }
};

//사용자 일정 추가 (POST /user/:userId/userSchdule)
export const addUserSchedule = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      userScheduleStart,
      userScheduleEnd,
      userScheduleTitle,
      userSchedulePlace,
      isPublic,
    } = req.body;

    //사용자 일정 데이터베이스에 추가
    const newUserSchedule = await prisma.userSchedule.create({
      data: {
        user_id: Number(userId),
        user_schedule_start: new Date(userScheduleStart),
        user_schedule_end: new Date(userScheduleEnd),
        user_schedule_title: userScheduleTitle,
        user_schedule_place: userSchedulePlace || "",
        user_schedule_participants: userScheduleParticipants || "",
        is_public: isPublic || true,
      },
    });

    logger.info("사용자 일정이 추가 됐습니다.");
    return res.status(201).json(newUserSchedule);
  } catch (error) {
    logger.error("사용자 일정 추가 중 오류 발생:", error);
    return res.status(500).json({ message: "사용자 일정 추가 중 오류 발생" });
  }
};

//사용자 일정 삭제 API (DELETE /user/:userId/userSchdule/:userScheduleId)
export const deleteUserSchedule = async (req, res) => {
  try {
    const { userScheduleId } = req.params;

    //사용자 일정 삭제
    await prisma.userSchedule.delete({
      where: { user_schedule_id: Number(userScheduleId) },
    });

    logger.info("사용자 일정이 삭제 됐습니다.", { userScheduleId });
    return res.status(200).json({ message: "사용자 일정이 삭제되었습니다." });
  } catch (error) {
    logger.error("사용자 일정 삭제 중 오류 발생:", error);
    return res.status(500).json({ message: "사용자 일정 삭제 중 오류 발생" });
  }
};

//사용자 일정 수정 API (PATCH /user/:userId/userSchedule/:userScheduld)
export const modifyUserSchedule = async (req, res) => {
  try {
    const { userId, userScheduleId } = req.params;
    const { userScheduleTime, userScheduleTitle, userSchedulePlace, isPublic } =
      req.body;

    //사용자 일정 수정 (부분 수정)
    const updatedUserSchedule = await prisma.userSchedule.update({
      where: { user_schedule_id: Number(userScheduleId) },
      data: {
        user_schedule_time: userScheduleTime
          ? new Date(userScheduleTime)
          : existingSchedule.user_schedule_time,
        user_schedule_title:
          userScheduleTitle ?? existingSchedule.user_schedule_title,
        user_schedule_place:
          userSchedulePlace ?? existingSchedule.user_schedule_place,
        is_public: isPublic ?? existingSchedule.is_public,
      },
    });

    logger.info("사용자 일정이 수정되었습니다.");

    return res.status(200).json(updatedUserSchedule);
  } catch (error) {
    logger.error("사용자 일정 수정 중 오류 발생:", error);
    return res.status(500).json({ message: "사용자 일정 수정 중 오류 발생" });
  }
};
