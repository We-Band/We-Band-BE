import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const findClubSchedulesByWeek = async (clubId, startDate, endDate) => {
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
};

export const findClubScheduleById = async (clubScheduleId) => {
  return prisma.clubSchedule.findUnique({
    where: { club_schedule_id: clubScheduleId },
  });
};

export const createClubSchedule = async (clubId, data) => {
  return prisma.clubSchedule.create({
    data: {
      club_id: clubId,
      club_schedule_start: new Date(data.clubScheduleStart),
      club_schedule_end: new Date(data.clubScheduleEnd),
      club_schedule_title: data.clubScheduleTitle,
      club_schedule_place: data.clubSchedulePlace || "",
    },
  });
};

export const deleteClubScheduleById = async (clubScheduleId) => {
  return prisma.clubSchedule.delete({
    where: { club_schedule_id: clubScheduleId },
  });
};

export const updateClubScheduleById = async (clubId, clubScheduleId, data) => {
  return prisma.clubSchedule.update({
    where: { club_schedule_id: clubScheduleId },
    data: {
      club_id: clubId,
      club_schedule_start: new Date(data.clubScheduleStart),
      club_schedule_end: new Date(data.clubScheduleEnd),
      club_schedule_title: data.clubScheduleTitle,
      club_schedule_place: data.clubSchedulePlace || "",
    },
  });
};
