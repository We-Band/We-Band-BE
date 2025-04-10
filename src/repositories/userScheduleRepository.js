import { prisma } from "../prisma/client.js";

export const getUserSchedulesByWeek = async (userId, startDate, endDate) => {
  return await prisma.userSchedule.findMany({
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
};

export const getUserScheduleById = async (userScheduleId) => {
  return await prisma.userSchedule.findUnique({
    where: { user_schedule_id: Number(userScheduleId) },
  });
};

export const createUserSchedule = async (data) => {
  return await prisma.userSchedule.create({ data });
};

export const deleteUserSchedule = async (userScheduleId) => {
  return await prisma.userSchedule.delete({
    where: { user_schedule_id: Number(userScheduleId) },
  });
};

export const updateUserSchedule = async (userScheduleId, data) => {
  return await prisma.userSchedule.update({
    where: { user_schedule_id: Number(userScheduleId) },
    data,
  });
};
