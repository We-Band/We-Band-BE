import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const teamRepository = {
  getMyTeams: async (clubId, userId) => {
    return await prisma.teamMember.findMany({
      where: {
        user_id: Number(userId),
        team: {
          club_id: Number(clubId),
        },
      },
      select: {
        team: {
          select: {
            team_id: true,
            team_img: true,
            team_name: true,
          },
        },
      },
    });
  },

  getAllTeams: async (clubId) => {
    return await prisma.team.findMany({
      where: {
        club_id: Number(clubId),
      },
      select: {
        team_id: true,
        team_img: true,
        team_name: true,
      },
    });
  },

  getTeamById: async (teamId) => {
    return await prisma.team.findUnique({
      where: { team_id: Number(teamId) },
      select: {
        team_id: true,
        team_img: true,
        team_name: true,
        club_id: true,
        team_leader: true,
      },
    });
  },

  getTeamMembers: async (teamId) => {
    return await prisma.teamMember.findMany({
      where: {
        team_id: Number(teamId),
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        user: {
          select: {
            user_id: true,
            user_name: true,
            profile_img: true,
          },
        },
      },
    });
  },

  getMemberList: async (clubId) => {
    return await prisma.teamMember.findMany({
      where: {
        club_id: Number(clubId),
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        user: {
          select: {
            user_id: true,
            user_name: true,
            profile_img: true,
          },
        },
      },
    });
  },

  createTeam: async (teamName, profileImageUrl, clubId, userId) => {
    return await prisma.team.create({
      data: {
        team_name: teamName,
        team_img: profileImageUrl,
        club_id: Number(clubId),
        team_leader: Number(userId),
      },
    });
  },

  updateTeamProfileImage: async (teamId, profileImageUrl) => {
    return await prisma.team.update({
      where: { team_id: Number(teamId) },
      data: { team_img: profileImageUrl },
    });
  },

  updateTeamName: async (teamId, teamName) => {
    return await prisma.team.update({
      where: { team_id: Number(teamId) },
      data: { team_name: teamName },
    });
  },

  addTeamMembers: async (teamId, members) => {
    return await prisma.teamMember.createMany({
      data: members.map((userId) => ({
        team_id: Number(teamId),
        user_id: Number(userId),
      })),
    });
  },

  deleteTeam: async (teamId) => {
    return await prisma.team.delete({
      where: { team_id: Number(teamId) },
    });
  },

  kickTeamMember: async (teamId, userId) => {
    return await prisma.teamMember.delete({
      where: {
        team_id_user_id: {
          team_id: Number(teamId),
          user_id: Number(userId),
        },
      },
    });
  },

  changeTeamLeader: async (teamId, newLeader) => {
    return await prisma.team.update({
      where: { team_id: Number(teamId) },
      data: { team_leader: Number(newLeader) },
    });
  },

  isTeamMember: async (targetUserId, teamId) => {
    return prisma.teamMember.findFirst({
      where: {
        team_id: Number(teamId),
        user_id: Number(targetUserId),
      },
    });
  },
};
