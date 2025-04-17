import { userScheduleRepository } from "../repositories/userScheduleRepository.js";
import { encodeBase91 } from "../utils/base91.js";
import { logger } from "../utils/logger.js";

export const userScheduleService = {
  fetchWeeklyUserSchedule: async ({ myId, userId, day }) => {
    //날짜를 주단위로 요청
    const inputDate = new Date(day);
    const startDate = new Date(inputDate);
    const dayOfWeek = inputDate.getDay();
    startDate.setDate(
      inputDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    ); //일요일 찾기
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    //보낼 정보 생성
    const userSchedules = await userScheduleRepository.getUserSchedulesByWeek(
      Number(userId),
      startDate,
      endDate
    );

    logger.debug("사용자 주간 일정 객체 생성 성공");

    //timeField연산
    let timeData = Array(210).fill(0);
    let events = [];

    for (let schedule of userSchedules) {
      let {
        user_schedule_id,
        user_schedule_start,
        user_schedule_end,
        user_schedule_title,
        is_public,
      } = schedule;

      if (Number(userId) !== Number(myId) && is_public) {
        user_schedule_id = -1;
        user_schedule_title = "비공개 일정";
      } //비공개 일정 설정

      const startIdx = Math.floor(
        (user_schedule_start - startDate) / (30 * 60 * 1000)
      ); //30분 단위 인덱스
      const length = Math.floor(
        (user_schedule_end - user_schedule_start) / (30 * 60 * 1000)
      );

      //해당 시간대에 일정이 있으면 1로 표시
      for (let i = startIdx; i < startIdx + length; i++) {
        timeData[i] = 1;
      }

      //events 배열 생성
      events.push([startIdx, length, user_schedule_id, user_schedule_title]);
    }

    const packedTimeData = [];
    for (let i = 0; i < timeData.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8; j++) {
        if (i + j < timeData.length) byte |= timeData[i + j] << (7 - j);
      }
      packedTimeData.push(byte);
    }

    //base91인코딩
    const timeField = encodeBase91(new Uint8Array(packedTimeData));

    logger.debug("사용자 주간 일정 객체 수정 완료");
    return {
      timeData: timeField,
      events,
    };
  },

  fetchUserScheduleDetail: async (myId, userId, userSchedule) => {
    const isVisible = Number(myId) !== Number(userId) && userSchedule.is_public;

    return {
      user_schedule_start: userSchedule.user_schedule_start,
      user_schedule_end: userSchedule.user_schedule_end,
      user_schedule_title: isVisible
        ? "비공개 일정"
        : userSchedule.user_schedule_title,
      user_schedule_place: isVisible ? "" : userSchedule.user_schedule_place,
      user_schedule_participants: isVisible
        ? ""
        : userSchedule.user_schedule_participants,
      is_public: userSchedule.is_public,
    };
  },

  addUserSchedule: async (userId, dto) => {
    return await userScheduleRepository.createUserSchedule({
      user_id: Number(userId),
      ...dto,
    });
  },

  updateUserSchedule: async (userScheduleId, dto) => {
    return await userScheduleRepository.updateUserSchedule(userScheduleId, dto);
  },

  deleteUserSchedule: async (userScheduleId) => {
    await userScheduleRepository.deleteUserSchedule(userScheduleId);
  },
};
