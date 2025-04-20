import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const userScheduleRepository = {
  getUserSchedulesByWeek: async (userId, startDate, endDate) => {
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
  },

  getUserScheduleById: async (userScheduleId) => {
    return await prisma.userSchedule.findUnique({
      where: { user_schedule_id: Number(userScheduleId) },
    });
  },

  createUserSchedule: async (data) => {
    return await prisma.userSchedule.create({
      data: {
        user_id: data.user_id,
        user_schedule_start: data.user_schedule_start,
        user_schedule_end: data.user_schedule_end,
        user_schedule_title: data.user_schedule_title,
        user_schedule_place: data.user_schedule_place,
        user_schedule_participants: data.user_schedule_participants,
        is_public: data.is_public,
      },
    });
  },

  deleteUserSchedule: async (userScheduleId) => {
    return await prisma.userSchedule.delete({
      where: { user_schedule_id: Number(userScheduleId) },
    });
  },

  updateUserSchedule: async (userScheduleId, data) => {
    return await prisma.userSchedule.update({
      where: { user_schedule_id: Number(userScheduleId) },
      data: {
        user_schedule_start: data.user_schedule_start,
        user_schedule_end: data.user_schedule_end,
        user_schedule_title: data.user_schedule_title,
        user_schedule_place: data.user_schedule_place,
        user_schedule_participants: data.user_schedule_participants,
        is_public: data.is_public,
      },
    });
  },
};
