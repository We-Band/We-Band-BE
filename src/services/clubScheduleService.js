import {
  findClubSchedulesByWeek,
  findClubScheduleById,
  createClubSchedule,
  deleteClubScheduleById,
  updateClubScheduleById,
} from "../repository/clubScheduleRepository.js";

import { encodeBase91 } from "../../utils/base91.js";

// 주간 일정 조회
export const getClubWeeklyScheduleService = async (clubId, day) => {
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

  const clubSchedules = await findClubSchedulesByWeek(
    Number(clubId),
    startDate,
    endDate
  );

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
    );
    const length = Math.floor(
      (club_schedule_end - club_schedule_start) / (30 * 60 * 1000)
    );

    for (let i = startIdx; i < startIdx + length; i++) {
      timeData[i] = 1;
    }

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

  const timeField = encodeBase91(new Uint8Array(packedTimeData));

  return {
    timeData: timeField,
    events,
  };
};

export const getClubScheduleDetailService = async (clubScheduleId) => {
  const clubSchedule = await findClubScheduleById(Number(clubScheduleId));
  if (!clubSchedule) throw new Error("일정이 존재하지 않습니다.");

  const {
    club_schedule_start,
    club_schedule_end,
    club_schedule_title,
    club_schedule_place,
  } = clubSchedule;

  return {
    club_schedule_start,
    club_schedule_end,
    club_schedule_title,
    club_schedule_place,
  };
};

export const createClubScheduleService = async (clubId, scheduleData) => {
  const newSchedule = await createClubSchedule(Number(clubId), scheduleData);
  return newSchedule;
};

export const deleteClubScheduleService = async (clubScheduleId) => {
  await deleteClubScheduleById(Number(clubScheduleId));
};

export const updateClubScheduleService = async (
  clubId,
  clubScheduleId,
  scheduleData
) => {
  const updated = await updateClubScheduleById(
    Number(clubId),
    Number(clubScheduleId),
    scheduleData
  );
  return updated;
};
