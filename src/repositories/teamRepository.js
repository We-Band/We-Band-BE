import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const teamRepository = {
  getMyTeams: async (clubId, userId) => {
    return prisma.teamMember.findMany({
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
    return prisma.team.findMany({
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
    return prisma.team.findUnique({
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
    return prisma.teamMember.findMany({
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
            profile_image: true,
          },
        },
      },
    });
  },

  getMemberList: async (clubId) => {
    return prisma.teamMember.findMany({
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
            profile_image: true,
          },
        },
      },
    });
  },

  createTeam: async (teamName, profileImageUrl, clubId) => {
    return prisma.team.create({
      data: {
        team_name: teamName,
        team_img: profileImageUrl,
        club_id: Number(clubId),
        team_leader: req.user.user_id,
      },
    });
  },

  addTeamMembers: async (teamId, members) => {
    return prisma.teamMember.createMany({
      data: members.map((member) => ({
        team_id: teamId,
        user_id: member.user_id,
      })),
    });
  },

  findTeamById: (teamId) => {
    return prisma.team.findUnique({ where: { team_id: Number(teamId) } });
  },

  updateTeamProfileImage: async (teamId, profileImageUrl) => {
    return prisma.team.update({
      where: { team_id: Number(teamId) },
      data: { profile_img: profileImageUrl },
    });
  },

  updateTeamName: async (teamId, teamName) => {
    return prisma.team.update({
      where: { team_id: Number(teamId) },
      data: { team_name: teamName },
    });
  },

  addTeamMembers: async (teamId, members) => {
    return prisma.teamMember.createMany({
      data: members.map((member) => ({
        team_id: teamId,
        user_id: member.user_id,
      })),
    });
  },

  deleteTeam: async (teamId) => {
    return prisma.team.delete({
      where: { team_id: Number(teamId) },
    });
  },

  kickTeamMember: async (teamId, userId) => {
    return prisma.teamMember.delete({
      where: {
        team_id: Number(teamId),
        user_id: Number(userId),
      },
    });
  },

  changeTeamLeader: async (teamId, newLeaderId) => {
    return prisma.team.update({
      where: { team_id: Number(teamId) },
      data: { team_leader: Number(newLeaderId) },
    });
  },

  isTeamMember: async (targetUserId, teamId) => {
    return prisma.team.findFirst({
      where: {
        team_id: Number(teamId),
        user_id: Number(targetUserId),
      },
    });
  },
};
