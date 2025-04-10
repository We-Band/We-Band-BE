import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const clubScheduleRepository = {
  getClubSchedulesByWeek: async (clubId, startDate, endDate) => {
    return prisma.clubSchedule.findMany({
      where: {
        club_id: clubId,
        club_schedule_start: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        club_schedule_id: true,
        club_schedule_start: true,
        club_schedule_end: true,
        club_schedule_title: true,
      },
      orderBy: {
        club_schedule_start: "asc",
      },
    });
  },

  getClubScheduleById: async (clubScheduleId) => {
    return await prisma.clubSchedule.findUnique({
      where: { club_schedule_id: Number(clubScheduleId) },
      select: {
        club_schedule_title: true,
        club_schedule_start: true,
        club_schedule_end: true,
        club_schedule_place: true,
      },
    });
  },

  createClubSchedule: async (scheduleData) => {
    return await prisma.clubSchedule.create({ data: scheduleData });
  },

  deleteClubScheduleById: async (clubScheduleId) => {
    return prisma.clubSchedule.delete({
      where: { club_schedule_id: Number(clubScheduleId) },
    });
  },
  updateUserSchedule: async (clubScheduleId, scheduleData) => {
    return await prisma.clubSchedule.update({
      where: { club_schedule_id: Number(clubScheduleId) },
      data: scheduleData,
    });
  },
};
