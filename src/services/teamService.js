import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/s3config.js"; // R2 클라이언트 설정
import { teamRepository } from "../repositories/teamRepository.js";
import {
  addTeamMembers,
  changeTeamLeader,
  deleteTeam,
  kickTeamMember,
} from "../controllers/teamControllers.js";

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
    return { status: 200, body: teams };
  },

  viewTeam: async ({ teamId }) => {
    const team = await teamRepository.getTeamById(teamId);
    if (!team) throw { status: 404, message: "팀을 찾을 수 없습니다." };
    logger.debug("팀 조회 성공", { teamId, team });
    return { status: 200, body: team };
  },

  viewMemberList: async ({ clubId }) => {
    const members = await teamRepository.getMemberList(clubId);
    if (!members)
      throw { status: 404, message: "회원 목록을 찾을 수 없습니다." };
    logger.debug("회원 목록 조회 성공", { clubId, members });
    return { status: 200, body: members };
  },

  createTeam: async ({ clubId, teamName, members }) => {
    const { teamName, members } = dto;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const bucketName = process.env.R2_BUCKET_NAME;

    let profileImageUrl;
    if (!req.file) {
      profileImageUrl = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com`;
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
    await addTeamMembers(createdTeam.team_id, members);

    return { message: "팀이 성공적으로 생성되었습니다." };
  },

  changeTeamProfile: async ({ teamId }) => {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const bucketName = process.env.R2_BUCKET_NAME;

    let profileImageUrl;
    if (!req.file) {
      profileImageUrl = `https://${bucketName}.${process.env.R2_PUBLIC_DOMAIN}/profile/default/default-image.jpg`;
    } else {
      const extractKeyFromUrl = (url) => new URL(url).pathname.slice(1);
      if (team.profile_img) {
        const oldKey = extractKeyFromUrl(team.profile_img);
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

    await updateTeamProfileImage(teamId, profileImageUrl);
    return {
      message: "팀 이미지가 성공적으로 업데이트되었습니다.",
      profile_img: profileImageUrl,
    };
  },

  changeTeamName: async ({ teamId, teamName }) => {
    await updateTeamName(teamId, teamName);
    return { message: "팀 이름이 성공적으로 변경되었습니다." };
  },

  addTeamMembers: async ({ teamId, members }) => {
    await addTeamMembers(teamId, members);
    return { message: "팀원이 성공적으로 추가되었습니다." };
  },

  deleteTeam: async ({ teamId }) => {
    await teamRepository.deleteTeam(teamId);
    return { message: "팀이 성공적으로 삭제되었습니다." };
  },

  kickTeamMember: async ({ teamId, userId }) => {
    const teamMember = await kickTeamMember(teamId, userId);
    if (!teamMember) throw { status: 404, message: "팀원을 찾을 수 없습니다." };
    return { message: "팀원이 성공적으로 제거되었습니다." };
  },

  leaveTeam: async ({ teamId }) => {
    const teamMember = await kickTeamMember(teamId, req.user.user_id);
    if (!teamMember) throw { status: 404, message: "팀원을 찾을 수 없습니다." };
    return { message: "팀을 성공적으로 탈퇴했습니다." };
  },

  changeTeamLeader: async ({ teamId, newLeaderId }) => {
    await changeTeamLeader(teamId, newLeaderId);
    return { message: "팀장이 성공적으로 변경되었습니다." };
  },
};
