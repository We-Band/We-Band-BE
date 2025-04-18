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

  getTeamScheduleById: async (teamScheduleId) => {
    return await prisma.teamSchedule.findUnique({
      where: { team_schedule_id: Number(teamScheduleId) },
      select: {
        team_schedule_title: true,
        team_schedule_start: true,
        team_schedule_end: true,
        team_schedule_place: true,
        team_schedule_participants: true,
      },
    });
  },

  createTeamSchedule: async (scheduleData) => {
    return await prisma.teamSchedule.create({ data: scheduleData });
  },

  createUserSchedule: async (userScheduleData) => {
    await prisma.userSchedule.createMany({ data: userScheduleData });
  },

  deleteTeamScheduleById: async (teamScheduleId) => {
    await prisma.teamSchedule.delete({
      where: { team_schedule_id: Number(teamScheduleId) },
    });
  },

  updateTeamSchedule: async (teamScheduleId, scheduleData) => {
    return await prisma.teamSchedule.update({
      where: { team_schedule_id: Number(teamScheduleId) },
      data: scheduleData,
    });
  },

  getTeamMemberUserIds: async (teamId) => {
    return await prisma.teamMember.findMany({
      where: { team_id: Number(teamId) },
      select: { user_id: true },
    });
  },

  getUserSchedules: async (userIds, startDate, endDate) => {
    return await prisma.userSchedule.findMany({
      where: {
        user_id: { in: userIds },
        user_schedule_start: { gte: startDate, lte: endDate },
      },
      select: {
        user_id: true,
        user_schedule_start: true,
        user_schedule_end: true,
      },
      orderBy: { user_schedule_start: "asc" },
    });
  },

  getUserNames: async (userIds) => {
    return await prisma.user.findMany({
      where: { user_id: { in: userIds } },
      select: { user_id: true, user_name: true },
    });
  },
};
