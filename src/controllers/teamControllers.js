import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";
import { teamService } from "../services/teamService.js";

const prisma = new PrismaClient();

// 동아리 팀 관련 API
// 팀 목록 조회 API (GET /clubs/:clubId/teams)
export const getTeam = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { type } = req.query; // 'my' 또는 'all'로 구분

    if (!type) {
      return res
        .status(400)
        .json({ message: "팀 목록 조회 타입을 입력해주세요." });
    }
    if (type !== "my" && type !== "all") {
      return res
        .status(400)
        .json({ message: "잘못된 팀 목록 조회 타입입니다." });
    }

    const teams = teamService.getTeam(clubId, type);
    return res.status(200).json({ teams });
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

    const teamInfo = teamService.viewTeam(teamId);

    logger.debug("팀 조회 성공", { clubId, teamId, teamInfo });
    return res.status(200).json({
      data: teamInfo,
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
    const teamMembers = await teamService.viewMemberList(clubId);

    logger.debug(`동아리 회원 목록 조회 성공, ${clubId}`);
    return res.status(200).json({ teamMember: teamMembers });
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

    await teamService.createTeam(clubId, teamName, members);

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
    const teamImg = req.file ? req.file : null;
    const { clubId, teamId } = req.params;

    await teamService.changeTeamProfile(teamImg, teamId);

    res
      .status(200)
      .json({ message: "팀 이미지가 성공적으로 업데이트되었습니다." });
  } catch (error) {
    logger.error("팀 이미지 변경 실패:", errosr);
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

    await teamService.changeTeamName({
      teamId: Number(teamId),
      teamName,
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

    await teamService.addTeamMembers({ teamId, members });

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
    await teamService.deleteTeam({ teamId });

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
    await teamService.kickTeamMember({ teamId, userId });

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

    await teamService.changeTeamLeader({ teamId, newLeader });

    logger.debug("팀장 변경 성공", { clubId, teamId, userId });
    return res
      .status(200)
      .json({ message: "팀장이 성공적으로 변경되었습니다." });
  } catch (error) {
    logger.error(`팀장 변경 검증 실패: ${error.message}`, { error });
    return res.status(500).json({ message: "팀장 변경 중 오류 발생" });
  }
};
