import express from "express";
import { logger } from "../utils/logger.js";
import { PrismaClient } from "@prisma/client";
import { encodeBase91 } from "../utils/base91.js";
const router = express.Router();

const prisma = new PrismaClient();

// (GET /clubs/:clubId/teams/:teamId/team-schedules?day=2025-03-10)
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

    // 8비트 단위로 바이트 배열 생성
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

    // base91로 인코딩
    const timeField = encodeBase91(new Uint8Array(packedTimeData));

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

//팀 일정 상세 조회 (GET /clubs/:clubId/teams/:teamId/team-schedules/:teamScheduleId)
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

//동아리 일정 추가 API (POST /clubs/:clubId/teams/:teamId/team-schedules)
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

    //팀일정 사용자 데이터베이스에 추가
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

//팀 일정 삭제 API (DELETE /clubs/:clubId/teams/:teamId/team-schedules/:teamScheduleId)
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

//팀 일정 수정 API (PATCH /clubs/:clubId/teams/:teamId/team-schedules/:teamScheduleId)
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

//팀 일정 조율 API (GET /clubs/:clubId/teams/:teamId/team-schedules/adjust?day=2025-03-10)
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

    // 팀 맴버 user_id 배열로 변환
    const userIdsArray = userIds.map((user) => user.user_id);

    // 날짜 범위
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

    //사용자 일정 조회
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

    //사용자 이름 조회를 위한 key-value json map
    // user_id를 키로, user_name을 값으로 하는 객체 생성
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

    // 일정 겹치는지 조회
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

    // 8비트 단위로 바이트 배열 생성
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

    // base91로 인코딩
    const timeField = encodeBase91(new Uint8Array(packedTimeData));

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
 const base91chars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~\"";

const base91DecodeTable = (() => {
  const table = {};
  for (let i = 0; i < base91chars.length; i++) {
    table[base91chars[i]] = i;
  }
  return table;
})();

export function decodeBase91(encoded) {
  let v = -1, b = 0, n = 0;
  const output = [];

  for (let i = 0; i < encoded.length; i++) {
    const c = encoded[i];
    if (!(c in base91DecodeTable)) continue;

    if (v < 0) {
      v = base91DecodeTable[c];
    } else {
      v += base91DecodeTable[c] * 91;
      b |= v << n;
      n += (v & 8191) > 88 ? 13 : 14;

      while (n >= 8) {
        output.push(b & 255);
        b >>= 8;
        n -= 8;
      }

      v = -1;
    }
  }

  if (v >= 0) {
    b |= v << n;
    n += 7;
    while (n >= 8) {
      output.push(b & 255);
      b >>= 8;
      n -= 8;
    }
  }

  return output;
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
