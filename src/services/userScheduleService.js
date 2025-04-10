import {
  getUserSchedulesByWeek,
  getUserScheduleById,
  createUserSchedule,
  deleteUserSchedule,
  updateUserSchedule,
} from "../repositories/userScheduleRepository.js";
import { encodeBase91 } from "../utils/base91.js";

export const fetchWeeklyUserSchedule = async (myId, userId, day) => {
  const inputDate = new Date(day);
  const startDate = new Date(inputDate);
  const dayOfWeek = inputDate.getDay();
  startDate.setDate(
    inputDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  );
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  const userSchedules = await getUserSchedulesByWeek(
    userId,
    startDate,
    endDate
  );
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
    }

    const startIdx = Math.floor(
      (user_schedule_start - startDate) / (30 * 60 * 1000)
    );
    const length = Math.floor(
      (user_schedule_end - user_schedule_start) / (30 * 60 * 1000)
    );

    for (let i = startIdx; i < startIdx + length; i++) timeData[i] = 1;
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

  return {
    timeData: encodeBase91(new Uint8Array(packedTimeData)),
    events,
  };
};

export const fetchUserScheduleDetail = async (myId, userId, userSchedule) => {
  const isPrivate = Number(myId) !== Number(userId) && userSchedule.is_public;

  return {
    user_schedule_start: userSchedule.user_schedule_start,
    user_schedule_end: userSchedule.user_schedule_end,
    user_schedule_title: isPrivate
      ? "비공개 일정"
      : userSchedule.user_schedule_title,
    user_schedule_place: isPrivate ? "" : userSchedule.user_schedule_place,
    user_schedule_participants: isPrivate
      ? "비공개 일정"
      : userSchedule.user_schedule_participants,
    is_public: userSchedule.is_public,
  };
};

export const addUserScheduleService = async (userId, dto) => {
  return await createUserSchedule({
    user_id: Number(userId),
    ...dto,
  });
};

export const updateUserScheduleService = async (userScheduleId, dto) => {
  return await updateUserSchedule(userScheduleId, dto);
};

export const deleteUserScheduleService = async (userScheduleId) => {
  return await deleteUserSchedule(userScheduleId);
};
s;
