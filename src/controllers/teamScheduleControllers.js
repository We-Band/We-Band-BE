import express from "express";
import { logger } from "../utils/logger.js";
import { PrismaClient } from "@prisma/client";
const router = express.Router();

const prisma = new PrismaClient();

export const viewTeamSchedule = async (req, res) => {
  try {
    const { clubId, teamId } = req.params;
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
    const teamSchedules = await prisma.teamSchedule.findMany({
      where: {
        team_id: Number(teamId),
        team_schedule_start: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        team_schedule_id: true,
        team_schedule_start: true,
        team_schedule_end: true,
        team_schedule_title: true,
      },
      orderBy: {
        team_schedule_start: "asc",
      },
    });

    let timeData = Array(210).fill(0);
    let events = [];

    for (let schedule of teamSchedules) {
      const {
        team_schedule_id,
        team_schedule_start,
        team_schedule_end,
        team_schedule_title,
      } = schedule;

      const startIdx = Math.floor(
        (team_schedule_start - startDate) / (30 * 60 * 1000)
      ); // 30분 단위 인덱스
      const length = Math.floor(
        (team_schedule_end - team_schedule_start) / (30 * 60 * 1000)
      );

      //해당 시간대에 일정이 있으면 1로 표시
      for (let i = startIdx; i < startIdx + length; i++) {
        timeData[i] = 1;
      }

      //events 배열에 시작인덱스, 인덱스길이, club_schedule_id, club_schedule_title 추가
      events.push([startIdx, length, team_schedule_id, team_schedule_title]);
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

    logger.debug("팀 주간 일정을 보냈습니다.");
    return res.json({
      timeData: timeField,
      events,
    });
  } catch (error) {
    logger.error(`팀 주간 일정 조회 중 오류 발생: ${error.message}`, error);
    return res
      .status(500)
      .json({ message: "팀 주간 일정 조회 중 오류가 발생했습니다." });
  }
};

export const viewDetailTeamSchedule = async (req, res) => {
  try {
    const { clubId, teamId, teamScheduleId } = req.params;
    const teamSchedule = req.teamSchedule;

    const {
      team_schedule_start,
      team_schedule_end,
      team_schedule_title,
      team_schedule_place,
      team_participants,
    } = teamSchedule;

    // 응답으로 필요한 필드만 보냄
    const result = {
      team_schedule_start,
      team_schedule_end,
      team_schedule_title,
      team_schedule_place,
      team_participants,
    };

    logger.debug(`팀 일정 정보를 보냈습니다., ${teamScheduleId}`);
    return res.json(result);
  } catch (error) {
    logger.error(`팀 일정 정보 조회 중 오류 발생: ${error.message}`, error);
    return res
      .status(400)
      .json({ message: "팀 일정 조회 중 오류가 발생했습니다." });
  }
};

//일정 추가 (POST /clubs/:clubId/clubSchdule)
export const addTeamSchedule = async (req, res) => {
  try {
    const { clubId, teamId } = req.params;
    const {
      teamScheduleStart,
      teamScheduleEnd,
      teamScheduleTitle,
      teamSchedulePlace,
      teamParticipants,
    } = req.body;

    const userIds = teamParticipants.split(",").map(Number);

    //팀일정  팀, 사용자 데이터베이스에 추가
    await prisma.$transaction(async (tx) => {
      await tx.teamSchedule.create({
        data: {
          team_id: Number(clubId),
          team_schedule_start: new Date(teamScheduleStart),
          team_schedule_end: new Date(teamScheduleEnd),
          team_schedule_title: teamScheduleTitle,
          team_schedule_place: teamSchedulePlace || "",
          team_participants: teamParticipants,
        },
      });

      const userScheduleData = userIds.map((userId) => ({
        user_id: userId,
        user_schedule_start: new Date(teamScheduleStart),
        user_schedule_end: new Date(teamScheduleEnd),
        user_schedule_title: teamScheduleTitle,
        user_schedule_place: teamSchedulePlace || "",
        user_schedule_participants: teamParticipants,
        is_public: true,
      }));

      await tx.userSchedule.createMany({ data: userScheduleData });
    });

    logger.debug("팀 일정이 사용자에게 추가되었습니다.");

    return res.status(201).json({ message: "팀 일정이 추가되었습니다." });
  } catch (error) {
    logger.error("팀 일정 추가 중 오류 발생:", error);
    return res.status(500).json({ message: "팀 일정 추가 중 오류 발생" });
  }
};

//동아리 일정 삭제 API (DELETE /clubs/:clubId/clubSchdule/:clubScheduleId)
export const deleteTeamSchedule = async (req, res) => {
  try {
    const { clubId, teamId, teamScheduleId } = req.params;

    //동아리 일정 삭제
    await prisma.teamSchedule.delete({
      where: { team_schedule_id: Number(teamScheduleId) },
    });

    logger.debug("팀 일정이 삭제 됐습니다.", { teamScheduleId });
    return res.status(200).json({ message: "팀 일정이 삭제되었습니다." });
  } catch (error) {
    logger.error("팀 일정 삭제 중 오류 발생:", error);
    return res.status(500).json({ message: "팀 일정 삭제 중 오류 발생" });
  }
};

//동아리 일정 수정 API (PATCH /clubs/:clubId/clubSchedule/:clubScheduld)
export const modifyTeamSchedule = async (req, res) => {
  try {
    const { clubId, teamId } = req.params;
    const {
      teamScheduleStart,
      teamScheduleEnd,
      teamScheduleTitle,
      teamSchedulePlace,
      teamParticipants,
    } = req.body;

    //동아리 일정 데이터베이스에 추가
    const updatedTeamSchedule = await prisma.teamSchedule.update({
      data: {
        team_id: Number(clubId),
        team_schedule_start: new Date(teamScheduleStart),
        team_schedule_end: new Date(teamScheduleEnd),
        team_schedule_title: teamScheduleTitle,
        team_schedule_place: teamSchedulePlace || "",
        team_participants: teamParticipants || "",
      },
    });

    logger.debug("팀 일정이 수정되었습니다.");
    return res.status(200).json(updatedTeamSchedule);
  } catch (error) {
    logger.error("팀 일정 수정 중 오류 발생:", error);
    return res.status(500).json({ message: "팀 일정 수정 중 오류 발생" });
  }
};

export const adjustSchedule = async (req, res) => {
  try {
    const { clubId, teamId } = req.params;
    const { day } = req.query;

    const userIds = await prisma.teamMember.findMany({
      where: {
        team_id: Number(teamId),
      },
      select: {
        user_id: true,
      },
    });
    const userIdsArray = userIds.map((user) => user.user_id);

    const inputDate = new Date(day);
    const dayOfWeek = inputDate.getDay();
    const startDate = new Date(inputDate);
    startDate.setDate(
      inputDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    );
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const timeData = Array(210).fill(0);
    const timeSlotUsers = Array(210)
      .fill(null)
      .map(() => new Set());

    const userSchedules = await prisma.userSchedule.findMany({
      where: {
        user_id: { in: userIdsArray },
        user_schedule_start: { gte: startDate, lte: endDate },
      },
      select: {
        user_id: true,
        user_schedule_start: true,
        user_schedule_end: true,
      },
      orderBy: {
        user_schedule_start: "asc",
      },
    });

    const userNames = await prisma.user.findMany({
      where: {
        user_id: { in: userIdsArray },
      },
      select: {
        user_id: true,
        user_name: true,
      },
    });

    const userNameMap = Object.fromEntries(
      userNames.map((user) => [user.user_id, user.user_name])
    );

    for (const {
      user_id,
      user_schedule_start,
      user_schedule_end,
    } of userSchedules) {
      const startIdx = Math.floor(
        (new Date(user_schedule_start) - startDate) / (30 * 60 * 1000)
      );
      const length = Math.floor(
        (new Date(user_schedule_end) - new Date(user_schedule_start)) /
          (30 * 60 * 1000)
      );

      for (let i = startIdx; i < startIdx + length; i++) {
        if (i >= 0 && i < 210) {
          timeSlotUsers[i].add(user_id);
        }
      }
    }

    // 최소 2명 이상 가능한 시간대만 1로 표시
    for (let i = 0; i < 210; i++) {
      if (timeSlotUsers[i].size >= 2) {
        timeData[i] = 1;
      }
    }

    // 30분 단위 timeData를 8bit씩 묶어서 packed
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
    const timeField = Buffer.from(packedTimeData).toString("base64");

    // events: 가능한 연속 시간 구간 추출
    const events = [];
    let i = 0;
    while (i < 210) {
      if (timeData[i] === 1) {
        const start = i;
        let users = new Set([...timeSlotUsers[i]]);
        while (i < 210 && timeData[i] === 1) {
          users = new Set([...users].filter((u) => timeSlotUsers[i].has(u)));
          i++;
        }
        const len = i - start;
        if (users.size >= 2) {
          events.push([Array.from(users), users.size, start, len]);
        }
      } else {
        i++;
      }
    }

    const eventString = events
      .map(([users, count, start]) => `${users.join(",")}|${count}|${start}`)
      .join(";");
    const encodedEvents = Buffer.from(eventString).toString("base64");

    logger.debug("팀 일정 조정 데이터를 전송했습니다.");
    return res.json({
      userNameMap,
      timeData: timeField,
      events: encodedEvents,
    });
  } catch (error) {
    logger.error("팀 일정 조정 중 오류 발생:", error);
    return res.status(500).json({ message: "팀 일정 조정 중 오류 발생" });
  }
};

/*timeField 클라이언트 디코딩
 const timeData = [];  
    for (let byte of buffer) {
      for (let i = 7; i >= 0; i--) {
          if (timeData.length < 210) { // 210개까지만 저장
              timeData.push((byte >> i) & 1);
            }
        }
    }
*/
/*encodedEvents 클라이언트 디코딩
const decodeEvent = (encoded) => {
  const decoded = atob(encoded);
  return decoded.split(";").map((item) => {
    const [usersStr, lenStr, startStr] = item.split("|");
    return [usersStr.split(",").map(Number), Number(lenStr), Number(startStr)];
  });
};
*/
