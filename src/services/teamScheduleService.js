import { teamScheduleRepository } from "../repository/teamScheduleRepository.js";
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

  teamClubSchedule: async ({ teamId, dto }) => {
    return await teamScheduleRepository.createteamSchedule({
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
};
