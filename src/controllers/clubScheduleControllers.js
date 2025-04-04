import express from "express";
import { logger } from "../utils/logger.js";
import { PrismaClient } from "@prisma/client";
const router = express.Router();

const prisma = new PrismaClient();

//(GET /clubs/:clubId/clubSchedules?day=2025-03-10)
export const viewClubSchedule = async (req, res) => {
  try {
    const { clubId } = req.params;
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
    const clubSchedules = await prisma.clubSchedule.findMany({
      where: {
        club_id: Number(clubId),
        club_schedule_start: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        club_schedule_id: true,
        club_schedule_start: true,
        club_schedule_end: true,
        club_schedule_title: true,
      },
      orderBy: {
        club_schedule_start: "asc",
      },
    });

    let timeData = Array(210).fill(0);
    let events = [];

    for (let schedule of clubSchedules) {
      const {
        club_schedule_id,
        club_schedule_start,
        club_schedule_end,
        club_schedule_title,
      } = schedule;

      const startIdx = Math.floor(
        (club_schedule_start - startDate) / (30 * 60 * 1000)
      ); // 30분 단위 인덱스
      const length = Math.floor(
        (club_schedule_end - club_schedule_start) / (30 * 60 * 1000)
      );

      //해당 시간대에 일정이 있으면 1로 표시
      for (let i = startIdx; i < startIdx + length; i++) {
        timeData[i] = 1;
      }

      //events 배열에 시작인덱스, 인덱스길이, club_schedule_id, club_schedule_title 추가
      events.push([startIdx, length, club_schedule_id, club_schedule_title]);
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

    /* 
    //프론트에서 디코딩 방법
    const timeDataBase64 = "여기에 서버에서 받은 timeData"; 

    // Base64를 디코딩하여 바이너리 데이터로 변환
    const buffer = Buffer.from(timeDataBase64, "base64");

    // 바이너리 데이터를 210칸짜리 0/1 배열로 변환
    const timeData = [];  
    for (let byte of buffer) {
      for (let i = 7; i >= 0; i--) {
          if (timeData.length < 210) { // 210개까지만 저장
              timeData.push((byte >> i) & 1);
            }
        }
    } */

    logger.debug("동아리 주간 일정을 보냈습니다.");
    return res.json({
      timeData: timeField,
      events,
    });
  } catch (error) {
    logger.error(`동아리 일정 정보 조회 중 오류 발생: ${error.message}`, error);
    return res
      .status(500)
      .json({ message: "동아리 정보 조회 중 오류가 발생했습니다." });
  }
};

//동아리 일정 정보 조회 API (GET /clubs/:clubId/clubSchedule/:clubScheduleId)
export const viewDetailClubSchedule = async (req, res) => {
  try {
    const { clubId, clubScheduleId } = req.params;
    const clubSchedule = req.clubSchedule;

    const {
      club_schedule_start,
      club_schedule_end,
      club_schedule_title,
      club_schedule_place,
    } = clubSchedule;

    // 응답으로 필요한 필드만 보냄
    const result = {
      club_schedule_start,
      club_schedule_end,
      club_schedule_title,
      club_schedule_place,
    };

    logger.debug(`동아리 일정 정보를 보냈습니다., ${clubScheduleId}`);
    return res.json(result);
  } catch (error) {
    logger.error(`동아리 일정 정보 조회 중 오류 발생: ${error.message}`, error);
    return res
      .status(400)
      .json({ message: "동아리 일정 정보 조회 중 오류가 발생했습니다." });
  }
};

//동아리 일정 추가 (POST /clubs/:clubId/clubSchdule)
export const addClubSchedule = async (req, res) => {
  try {
    const { clubId } = req.params;
    const {
      clubScheduleStart,
      clubScheduleEnd,
      clubScheduleTitle,
      clubSchedulePlace,
    } = req.body;

    //동아리 일정 데이터베이스에 추가
    const newClubSchedule = await prisma.clubSchedule.create({
      data: {
        club_id: Number(clubId),
        club_schedule_start: new Date(clubScheduleStart),
        club_schedule_end: new Date(clubScheduleEnd),
        club_schedule_title: clubScheduleTitle,
        club_schedule_place: clubSchedulePlace || "",
      },
    });

    logger.debug("동아리 일정이 추가 됐습니다.");
    return res.status(201).json(newClubSchedule);
  } catch (error) {
    logger.error("동아리 일정 추가 중 오류 발생:", error);
    return res.status(500).json({ message: "동아리 일정 추가 중 오류 발생" });
  }
};

//동아리 일정 삭제 API (DELETE /clubs/:clubId/clubSchdule/:clubScheduleId)
export const deleteClubSchedule = async (req, res) => {
  try {
    const { clubId, clubScheduleId } = req.params;

    //동아리 일정 삭제
    await prisma.clubSchedule.delete({
      where: { club_schedule_id: Number(clubScheduleId) },
    });

    logger.debug("동아리 일정이 삭제 됐습니다.", { clubScheduleId });
    return res.status(200).json({ message: "동아리 일정이 삭제되었습니다." });
  } catch (error) {
    logger.error("동아리 일정 삭제 중 오류 발생:", error);
    return res.status(500).json({ message: "동아리 일정 삭제 중 오류 발생" });
  }
};

//동아리 일정 수정 API (PATCH /clubs/:clubId/clubSchedule/:clubScheduld)
export const modifyClubSchedule = async (req, res) => {
  try {
    const { clubId, clubScheduleId } = req.params;
    const {
      clubScheduleStart,
      clubScheduleEnd,
      clubScheduleTitle,
      clubSchedulePlace,
    } = req.body;

    //동아리 일정 수정 (부분 수정)
    const updatedClubSchedule = await prisma.clubSchedule.update({
      where: { club_schedule_id: Number(clubScheduleId) },
      data: {
        club_id: Number(clubId),
        club_schedule_start: new Date(clubScheduleStart),
        club_schedule_end: new Date(clubScheduleEnd),
        club_schedule_title: clubScheduleTitle,
        club_schedule_place: clubSchedulePlace || "",
      },
    });

    logger.debug("동아리 일정이 수정되었습니다.");

    return res.status(200).json(updatedClubSchedule);
  } catch (error) {
    logger.error("동아리 일정 수정 중 오류 발생:", error);
    return res.status(500).json({ message: "동아리 일정 수정 중 오류 발생" });
  }
};
