import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/s3config.js"; // R2 클라이언트 설정
import { teamRepository } from "../repositories/teamRepository.js";

const prisma = new PrismaClient();

export const teamService = {
  getTeam: async ({ clubId, type }) => {
    let teams;
    if (type === "my") {
      teams = await teamRepository.getMyTeams(clubId, userId);
    } else {
      teams = await teamRepository.getAllTeams(clubId);
    }
    logger.debug("팀 목록 조회 성공", { clubId, type, teams });
    return { teams };
  },

  viewTeam: async ({ teamId }) => {
    const team = {
      teamId: team.team_id,
      creator: team.team_leader,
      teamName: team.team_name,
    };
    const members = await teamRepository.getTeamMembers(teamId);
    logger.debug("팀 조회 성공", { teamId, team });
    return { team, members };
  },

  viewMemberList: async ({ clubId }) => {
    const members = await teamRepository.getMemberList(clubId);
    if (!members) throw { message: "회원 목록을 찾을 수 없습니다." };
    logger.debug("회원 목록 조회 성공", { clubId, members });
    return { members };
  },

  createTeam: async ({ clubId, teamName, members }) => {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const bucketName = process.env.R2_BUCKET_NAME;

    let profileImageUrl;
    if (!req.file) {
      profileImageUrl = `https://we-band.534b5de33d3d2ad79d00087224cf4d73.r2.cloudflarestorage.com/default-profile/1744607107947`;
    } else {
      const key = `profile/custom/${req.user.userID}/${
        req.user.userID
      }-${Date.now()}`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );
      profileImageUrl = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;
    }

    const createdTeam = await teamRepository.createTeam(
      teamName,
      profileImageUrl,
      clubId
    );
    await teamRepository.addTeamMembers(createdTeam.team_id, members);
    logger.debug("팀 생성 성공", { clubId, teamName, members });
  },

  changeTeamProfile: async ({ teamId, teamImg }) => {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const bucketName = process.env.R2_BUCKET_NAME;

    let profileImageUrl;
    if (!teamImg) {
      profileImageUrl = `https://${bucketName}.${process.env.R2_PUBLIC_DOMAIN}/profile/default/default-image.jpg`;
      //기본 이미지 추후에 버킷에 업로드하고 설정할 예정
    } else {
      const extractKeyFromUrl = (url) => new URL(url).pathname.slice(1);
      if (team.team_img) {
        const oldKey = extractKeyFromUrl(team.team_img);
        await s3Client.send(
          new DeleteObjectCommand({ Bucket: bucketName, Key: oldKey })
        );
      }
      const key = `profile/team/${teamId}/${teamId}-${Date.now()}`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );
      profileImageUrl = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;
    }

    await teamRepository.updateTeamProfileImage(teamId, profileImageUrl);
  },

  changeTeamName: async ({ teamId, teamName }) => {
    await teamRepository.updateTeamName(teamId, teamName);
  },

  addTeamMembers: async ({ teamId, members }) => {
    await teamRepository.addTeamMembers(teamId, members);
  },

  deleteTeam: async ({ teamId }) => {
    await teamRepository.deleteTeam(teamId);
  },

  kickTeamMember: async ({ teamId, userId }) => {
    const teamMember = await teamRepository.kickTeamMember(teamId, userId);
    if (!teamMember) throw { status: 404, message: "팀원을 찾을 수 없습니다." };
  },

  leaveTeam: async ({ teamId }) => {
    const teamMember = await teamRepository.kickTeamMember(
      teamId,
      req.user.user_id
    );
    if (!teamMember) throw { status: 404, message: "팀원을 찾을 수 없습니다." };
  },

  changeTeamLeader: async ({ teamId, newLeader }) => {
    await teamRepository.changeTeamLeader(teamId, newLeader);
  },
};
