import { clubScheduleRepository } from "../repositories/clubScheduleRepository.js";
import { encodeBase91 } from "../utils/base91.js";
import { logger } from "../utils/logger.js";

// 주간 일정 조회
export const clubScheduleService = {
  getClubWeeklySchedule: async (clubId, day) => {
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

    const clubSchedules = await clubScheduleRepository.getClubSchedulesByWeek(
      Number(clubId),
      startDate,
      endDate
    );

    logger.debug("동아리 주간 일정 객체 생성 성공");

    //timeField연산
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
      ); //30분 단위 인덱스
      const length = Math.floor(
        (club_schedule_end - club_schedule_start) / (30 * 60 * 1000)
      );

      //해당 시간에 일정이 있으면 1로 표시
      for (let i = startIdx; i < startIdx + length; i++) {
        timeData[i] = 1;
      }

      //events 배열 생성
      events.push([startIdx, length, club_schedule_id, club_schedule_title]);
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

    logger.debug("동아리 주간 일정 객체 수정 완료");
    return {
      timeData: timeField,
      events,
    };
  },

  addClubSchedule: async ({ clubId, dto }) => {
    return await clubScheduleRepository.createclubSchedule({
      club_id: Number(clubId),
      ...dto,
    });
  },

  updateClubSchedule: async ({ clubScheduleId, dto }) => {
    return await clubScheduleRepository.updateClubSchedule(clubScheduleId, dto);
  },

  deleteClubSchedule: async (clubScheduleId) => {
    await deleteClubScheduleById(Number(clubScheduleId));
  },
};
