import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const teamScheduleRepository = {
  getTeamSchedulesByWeek: async (teamId, startDate, endDate) => {
    return prisma.teamSchedule.findMany({
      where: {
        team_id: teamId,
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
  },

  getteamScheduleById: async (teamScheduleId) => {
    return await prisma.teamSchedule.findUnique({
      where: { team_schedule_id: Number(teamScheduleId) },
      select: {
        team_schedule_title: true,
        team_schedule_start: true,
        team_schedule_end: true,
        tema_schedule_place: true,
        team_schedule_participants: true,
      },
    });
  },

  createTeamSchedule: async (scheduleData) => {
    return await prisma.teamSchedule.create({ data: scheduleData });
  },

  deleteTeamScheduleById: async (temaScheduleId) => {
    return prisma.teamSchedule.delete({
      where: { team_schedule_id: Number(temaScheduleId) },
    });
  },

  updateTeamSchedule: async (teamScheduleId, scheduleData) => {
    return await prisma.teamSchedule.update({
      where: { team_schedule_id: Number(teamScheduleId) },
      data: scheduleData,
    });
  },
};
