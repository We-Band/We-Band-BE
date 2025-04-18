import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const clubRepository = {
  getClubById: async (clubId) => {
    return await prisma.club.findUnique({
      where: { club_id: Number(clubId) },
      select: {
        club_id: true,
        club_name: true,
        club_code: true,
        club_leader: true,
        member_count: true,
        created_at: true,
      },
    });
  },

  findByCode: async (code) => {
    return await prisma.club.findUnique({
      where: { club_code: code },
      select: { club_id: true },
    });
  },

  isMember: async (clubId, userId) => {
    return await prisma.clubMember.findFirst({
      where: { club_id: clubId, user_id: userId },
    });
  },

  addMember: async (clubId, userId) => {
    return await prisma.clubMember.create({
      data: { club_id: clubId, user_id: userId },
    });
  },

  removeMember: async (clubId, userId) => {
    await prisma.clubMember.delete({
      where: { club_id_user_id: { club_id: clubId, user_id: userId } },
    });
  },

  incrementMemberCount: async (clubId) => {
    return await prisma.club.update({
      where: { club_id: clubId },
      data: { member_count: { increment: 1 } },
    });
  },

  decrementMemberCount: async (clubId) => {
    return await prisma.club.update({
      where: { club_id: clubId },
      data: { member_count: { decrement: 1 } },
    });
  },

  updateCode: async (clubId, newCode) => {
    return await prisma.club.update({
      where: { club_id: clubId },
      data: { club_code: newCode },
    });
  },

  updateLeader: async (clubId, newLeader) => {
    return await prisma.club.update({
      where: { club_id: clubId },
      data: { club_leader: newLeader },
    });
  },

  getMembers: async (clubId) => {
    return await prisma.clubMember.findMany({
      where: { club_id: Number(clubId) },
      orderBy: { created_at: "asc" },
      select: {
        user: {
          select: { user_id: true, user_name: true, profile_img: true },
        },
      },
    });
  },
};
