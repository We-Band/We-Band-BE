import { teamScheduleRepository } from "../repositories/teamScheduleRepository.js";
import { encodeBase91 } from "../../utils/base91.js";
import { logger } from "../utils/logger.js";

// 주간 일정 조회
export const teamScheduleService = {
  getTeamWeeklySchedule: async (teamId, day) => {
    const inputDate = new Date(day);
    const dayOfWeek = inputDate.getDay();
    const startDate = new Date(inputDate);
    startDate.setDate(
      inputDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    ); // 월요일
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const teamSchedules = await teamScheduleRepository.getTeamSchedulesByWeek(
      Number(teamId),
      startDate,
      endDate
    );

    logger.debug("팀 주간 일정 객체 생성 성공");

    //timeField연산
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
      ); //30분 단위 인덱스
      const length = Math.floor(
        (team_schedule_end - team_schedule_start) / (30 * 60 * 1000)
      );

      //해당 시간에 일정이 있으면 1로 표시
      for (let i = startIdx; i < startIdx + length; i++) {
        timeData[i] = 1;
      }

      //events 배열 생성
      events.push([startIdx, length, team_schedule_id, team_schedule_title]);
    }

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

    //base91인코딩
    const timeField = encodeBase91(new Uint8Array(packedTimeData));

    logger.debug("팀 주간 일정 객체 수정 완료");
    return {
      timeData: timeField,
      events,
    };
  },

  addTeamSchedule: async ({ teamId, dto }) => {
    const {
      teamScheduleStart,
      teamScheduleEnd,
      teamScheduleTitle,
      teamSchedulePlace,
      teamParticipants,
    } = dto;

    const userIds = await teamScheduleRepository.getTeamMemberUserIds(teamId);
    const userScheduleData = userIds.map((userId) => ({
      user_id: userId,
      user_schedule_start: new Date(teamScheduleStart),
      user_schedule_end: new Date(teamScheduleEnd),
      user_schedule_title: teamScheduleTitle,
      user_schedule_place: teamSchedulePlace || "",
      user_schedule_participants: teamParticipants || "",
      is_public: true,
    }));

    logger.debug("사용자 일정 데이터 생성 완료");
    await teamScheduleRepository.createUserSchedule(userScheduleData);

    return await teamScheduleRepository.createTeamSchedule({
      team_id: Number(teamId),
      ...dto,
    });
  },

  updateTeamSchedule: async ({ teamScheduleId, dto }) => {
    return await teamScheduleRepository.updateTeamSchedule(teamScheduleId, dto);
  },

  deleteTeamSchedule: async (teamScheduleId) => {
    await deleteTeamScheduleById(Number(teamScheduleId));
  },

  adjustTeamSchedule: async ({ teamId, day }) => {
    // 팀 맴버 user_id 배열로 변환
    const userIds = await teamScheduleRepository.getTeamMemberUserIds(teamId);
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
    const userSchedules = await teamScheduleRepository.getUserSchedules(
      userIdsArray,
      startDate,
      endDate
    );

    logger.debug("사용자 일정 조회 성공");

    //사용자 이름 조회를 위한 key-value json map
    // user_id를 키로, user_name을 값으로 하는 객체 생성
    const userNames = await teamScheduleRepository.getUserNames(userIdsArray);
    const userNameMap = Object.fromEntries(
      userNames.map((u) => [u.user_id, u.user_name])
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
        if (i >= 0 && i < 210) timeSlotUsers[i].add(user_id);
      }
    }

    // 최소 2명 이상 가능한 시간대만 1로 표시
    for (let i = 0; i < 210; i++) {
      if (timeSlotUsers[i].size >= 2) timeData[i] = 1;
    }

    // 8비트 단위로 바이트 배열 생성
    const packedTimeData = [];
    for (let i = 0; i < timeData.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8; j++) {
        if (i + j < timeData.length) byte |= timeData[i + j] << (7 - j);
      }
      packedTimeData.push(byte);
    }

    logger.debug("배열 생성 성공");
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
        if (users.size >= 2)
          events.push([Array.from(users), users.size, start, len]);
      } else i++;
    }

    const eventString = events
      .map(([users, count, start]) => `${users.join(",")}|${count}|${start}`)
      .join(";");
    const encodedEvents = Buffer.from(eventString).toString("base64");

    logger.debug("events객체 생성 성공");

    return {
      userNameMap,
      timeData: timeField,
      events: encodedEvents,
    };
  },
};
