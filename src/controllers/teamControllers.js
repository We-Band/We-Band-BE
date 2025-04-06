import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/s3config.js"; // R2 클라이언트 설정

const prisma = new PrismaClient();

// 동아리 팀 관련 API
// 팀 목록 조회 API (GET /clubs/:clubId/teams)
export const getTeam = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { type } = req.query;

    // type이 "my"인 경우, 내가 속한 팀 목록 조회
    if (type == "my") {
      const userId = req.user.user_id;

      const myTeams = await prisma.teamMember.findMany({
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
      logger.debug("내 팀 목록 조회 성공", { clubId, myTeams });
      return res.status(200).json(myTeams);
    } else {
      // type이 없는경우 모든 팀 목록 조회
      const teams = await prisma.team.findMany({
        where: {
          club_id: Number(clubId),
        },
        select: {
          team_id: true,
          team_img: true,
          team_name: true,
        },
      });

      logger.debug("팀 목록 조회 성공", { clubId, teams });
      return res.status(200).json(teams);
    }
  } catch (error) {
    logger.error(`팀 목록 조회 검증 실패: ${error.message}`, { error });
    return res
      .status(500)
      .json({ message: "팀 목록 조회 중 오류가 발생했습니다." });
  }
};

// 팀 정보 조회 API (GET /clubs/:clubId/teams/:teamId)
export const viewTeam = async (req, res) => {
  try {
    const { clubId, teamId } = req.params;

    const teamInfo = {
      teamId: req.team.team_id,
      creator: req.team.creator,
      teamName: req.team.team_name,
    };

    // 팀원 정보 조회
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        team_id: Number(teamId),
      },
      select: {
        user_id: true,
        user: {
          select: {
            user_id: true,
            user_name: true,
            profile_image: true,
          },
        },
      },
    });

    logger.debug("팀 조회 성공", { teamId, teamInfo, teamMember });
    return res.status(200).json({
      teamInfo,
      teamMember,
    });
  } catch (error) {
    logger.error(`팀 조회 검증 실패: ${error.message}`, { error });
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};

// 팀원 목록 조회 API (GET /clubs/:clubId/teams/:teamId/members)
export const viewMemberList = async (req, res) => {
  try {
    const { clubId } = req.params;
    const clubMembers = await prisma.clubMember.findMany({
      where: {
        club_id: Number(clubId),
      },
      orderBy: {
        created_at: "asc", // 회원을 ID 순서대로 정렬
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

    const members = clubMembers.map((member) => ({
      userId: member.user_id,
      userName: member.user.user_name,
      profileImage: member.user.profile_image,
    }));

    logger.debug(`동아리 회원 목록 조회 성공, ${clubId}`);
    return res.status(200).json(members);
  } catch (error) {
    logger.error(`동아리 회원 목록 조회 중 오류 발생: ${error.message}`);
    return res
      .status(500)
      .json({ message: "동아리 회원 목록 조회 중 오류가 발생했습니다." });
  }
};

// 팀 생성 API (POST /clubs/:clubId/teams)
export const createTeam = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { teamName, members } = req.body;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    let profileImageUrl;

    if (!teamName) {
      return res.status(400).json({ message: "팀 이름을 입력해주세요." });
    }

    if (!members || members.length === 0) {
      return res.status(400).json({ message: "팀원을 추가해주세요." });
    }

    // 파일이 없으면 기본 이미지를 사용
    if (!req.file) {
      // 기본 이미지 URL (AWS S3에 저장된 기본 이미지를 사용할 수 있도록 따로 설정예정)
      profileImageUrl = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com`;
    } else {
      // 파일이 있으면 AWS S3에 업로드
      const bucketName = process.env.R2_BUCKET_NAME;
      const key = `profile/custom/${req.user.userID}/${
        req.user.userID
      }-${Date.now()}`;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: req.file.buffer, // Multer는 파일 데이터를 buffer로 제공
        ContentType: req.file.mimetype, // 파일의 MIME 타입
      });

      await s3Client.send(command);

      // 업로드된 파일의 URL 생성
      profileImageUrl = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;
    }

    // 팀 생성
    const createdTeam = await prisma.team.create({
      data: {
        team_name: teamName,
        team_img: profileImageUrl,
        club_id: Number(clubId),
        team_leader: req.user.user_id,
      },
    });

    await prisma.teamMember.createMany({
      data: members.map((member) => ({
        team_id: createdTeam.team_id,
        user_id: member.user_id,
      })),
    });

    logger.debug("팀 생성 성공", { clubId, teamName, members });
    return res.status(201).json({ message: "팀이 성공적으로 생성되었습니다." });
  } catch (error) {
    logger.error("팀 생성 실패: ", error);
    return res
      .status(500)
      .json({ message: "팀 생성 중 서버 오류가 발생했습니다." });
  }
};
// 팀 이미지 변경 API (PUT /clubs/:clubId/teams/:teamId/profile)
export const changeTeamProfile = async (req, res) => {
  try {
    const teamId = req.team.team_id;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const bucketName = process.env.R2_BUCKET_NAME;

    // 기존 팀 정보 가져오기
    const team = await prisma.team.findUnique({
      where: { team_id: teamId },
    });

    if (!team) {
      return res.status(404).json({ message: "팀을 찾을 수 없습니다." });
    }

    let profileImageUrl;

    // 파일이 없는 경우 → 기본 이미지 사용
    if (!req.file) {
      profileImageUrl = `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_PUBLIC_DOMAIN}/profile/default/default-image.jpg`;
    } else {
      const extractKeyFromUrl = (url) => {
        try {
          const parts = new URL(url);
          return parts.pathname.slice(1); // 맨 앞 '/' 제거
        } catch (err) {
          return null;
        }
      };

      // 기존 이미지 삭제
      if (team.profile_img) {
        const oldKey = extractKeyFromUrl(team.profile_img);
        if (oldKey) {
          try {
            const deleteCommand = new DeleteObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME,
              Key: oldKey,
            });
            await s3Client.send(deleteCommand);
          } catch (err) {
            logger.warn(`기존 이미지 삭제 실패: ${err.message}`);
          }
        }
      }

      // 새 이미지 업로드
      const key = `profile/team/${teamId}/${teamId}-${Date.now()}`;

      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });

      await s3Client.send(uploadCommand);

      profileImageUrl = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;
    }

    // DB 업데이트
    await prisma.team.update({
      where: { team_id: teamId },
      data: { profile_img: profileImageUrl },
    });

    res.status(200).json({
      message: "팀 이미지가 성공적으로 업데이트되었습니다.",
      profile_img: profileImageUrl,
    });
  } catch (error) {
    logger.error("팀 이미지 변경 실패:", error);
    res.status(500).json({ message: "팀 이미지를 변경 중 서버 오류 발생" });
  }
};

// 팀 이름 변경 API (PATCH /clubs/:clubId/teams/:teamId/name)
export const changeTeamName = async (req, res) => {
  try {
    const { clubId, teamId } = req.params;
    const { teamName } = req.body;

    if (!teamName) {
      return res.status(400).json({ message: "팀 이름을 입력해주세요." });
    }

    await prisma.team.update({
      where: {
        team_id: Number(teamId),
      },
      data: {
        team_name: teamName,
      },
    });

    logger.debug("팀 이름 변경 성공", { clubId, teamId, teamName });
    return res
      .status(200)
      .json({ message: "팀 이름이 성공적으로 변경되었습니다." });
  } catch (error) {
    logger.error(`팀 이름 변경 검증 실패: ${error.message}`, { error });
    return res.status(500).json({ message: "팀 이름 변경 중 오류 발생" });
  }
};

// 팀원 추가 API (POST /clubs/:clubId/teams/:teamId/members)
export const addTeamMembers = async (req, res) => {
  try {
    const { clubId, teamId } = req.params;
    const { members } = req.body; // 추가할 팀원 ID 배열

    if (!members || members.length === 0) {
      return res.status(400).json({ message: "추가할 팀원을 입력해주세요." });
    }

    // 팀원 추가
    await prisma.teamMember.createMany({
      data: members.map((member) => ({
        team_id: Number(teamId),
        user_id: member.userId,
      })),
    });

    logger.debug("팀원 추가 성공", { clubId, teamId, members });
    return res
      .status(200)
      .json({ message: "팀원이 성공적으로 추가되었습니다." });
  } catch (error) {
    logger.error(`팀원 추가 검증 실패: ${error.message}`, { error });
    return res.status(500).json({ message: "팀원 추가 중 오류 발생" });
  }
};

// 팀 삭제 API (DELETE /clubs/:clubId/teams/:teamId)
export const deleteTeam = async (req, res) => {
  try {
    const { clubId, teamId } = req.params;

    // 팀 삭제
    await prisma.team.delete({
      where: {
        team_id: Number(teamId),
      },
    });

    logger.debug("팀 삭제 성공", { clubId, teamId, userId });
    return res.status(200).json({ message: "팀이 성공적으로 삭제되었습니다." });
  } catch (error) {
    logger.error(`팀 삭제 검증 실패: ${error.message}`, { error });
    return res.status(500).json({ message: "팀 삭제 중 오류 발생" });
  }
};

// 팀원 삭제 API (DELETE /clubs/:clubId/teams/:teamId/members)
export const kickTeamMember = async (req, res) => {
  try {
    const { clubId, teamId } = req.params;
    const { userId } = req.body; // 삭제할 사용자 ID

    // 팀원 삭제
    await prisma.teamMember.delete({
      where: {
        team_id_user_id: {
          team_id: Number(teamId),
          user_id: Number(userId),
        },
      },
    });

    logger.debug("팀원 삭제 성공", { clubId, teamId, userId });
    return res
      .status(200)
      .json({ message: "팀원이 성공적으로 삭제되었습니다." });
  } catch (error) {
    logger.error(`팀원 삭제 검증 실패: ${error.message}`, { error });
    return res.status(500).json({ message: "팀원 삭제 중 오류 발생" });
  }
};

// 팀 탈퇴 API (DELETE /clubs/:clubId/teams/:teamId/leave)
export const leaveTeam = async (req, res) => {
  try {
    const { clubId, teamId } = req.params;
    const userId = req.user.user_id;

    // 팀원 삭제
    await prisma.teamMember.delete({
      where: {
        team_id_user_id: {
          team_id: Number(teamId),
          user_id: Number(userId),
        },
      },
    });

    logger.debug("팀원 삭제 성공", { clubId, teamId, userId });
    return res
      .status(200)
      .json({ message: "팀에서 성공적으로 탈퇴되었습니다." });
  } catch (error) {
    logger.error(`팀원 삭제 검증 실패: ${error.message}`, { error });
    return res.status(500).json({ message: "팀 탈퇴 중 오류 발생" });
  }
};

// 팀장 변경 API (PATCH /clubs/:clubId/teams/:teamId/leader)
export const changeTeamLeader = async (req, res) => {
  try {
    const { clubId, teamId } = req.params;
    const { newLeader } = req.body; // 새로운 팀장 ID

    // 팀장 변경
    await prisma.team.update({
      where: {
        team_id: Number(newLeader),
      },
      data: {
        creator: Number(userId),
      },
    });

    logger.debug("팀장 변경 성공", { clubId, teamId, userId });
    return res
      .status(200)
      .json({ message: "팀장이 성공적으로 변경되었습니다." });
  } catch (error) {
    logger.error(`팀장 변경 검증 실패: ${error.message}`, { error });
    return res.status(500).json({ message: "팀장 변경 중 오류 발생" });
  }
};
