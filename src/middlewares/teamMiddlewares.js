import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";
import { teamService } from "../services/teamService.js";
import { teamRepository } from "../repositories/teamRepository.js";
const prisma = new PrismaClient();

// 동아리 팀 존재 여부 검증 미들웨어
export const verifyTeam = async (req, res, next) => {
  try {
    const { clubId, teamId } = req.params;

    const team = teamRepository.getTeamById(teamId);

    if (!team) {
      logger.debug(`존재하지 않는 팀 입니다 ${teamId}`);
      return res.status(404).json({ message: "존재하지 않는 팀입니다." });
    }

    req.team = team;

    logger.debug("팀 존재 여부 검증 완료");
    next();
  } catch (error) {
    logger.error(`팀 여부 검증 실패${error.message}`, { error });
    return res
      .status(500)
      .json({ message: "팀 존재 여부 검증 중 오류가 발생했습니다." });
  }
};

// 팀장 여부 검증 미들웨어
export const isTeamLeader = async (req, res, next) => {
  try {
    const { clubId, teamId } = req.params;
    const userId = req.user.user_id;
    const teamLeader = req.team.team_leader;

    if (teamLeader !== userId) {
      logger.debug(
        "해당팀의 팀장이 아닙니다",
        { clubId },
        { teamId },
        { userId }
      );
      return res
        .status(401)
        .json({ message: "해당 기능에 접근할 권한이 없습니다." });
    }

    logger.debug("팀장 검증 완료", { clubId }, { userId });
    next();
  } catch (error) {
    logger.error(`회장 검증 과정 중 실패: ${error.message}`, { error });
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};

export const isTeamMember = async (req, res, next) => {
  try {
    const { clubId, teamId } = req.params;
    const userIdFromBody = req.body;
    const userIdFromToken = req.user.user_id;
    const route = req.route.path;

    let targetUserId;
    if (route.includes("kick-member")) {
      targetUserId = userIdFromBody;
    } else if (route.includes("leave")) {
      targetUserId = userIdFromToken;
    } else {
      return res.status(400).json({ message: "지원하지 않는 요청입니다." });
    }

    const isTeamMember = await teamRepository.isTeamMember({
      targetUserId,
      teamId,
    });
    if (isTeamMember) {
      logger.debug("팀원 검증 완료");
    } else {
      logger.debug("팀에 속한 유저가 아닙니다.");
    }
  } catch (error) {
    logger.error(`팀원 검증 과정 중 실패 ${error.message}`, { error });
    return res.status(500).json({ messae: "서버 오류 발생" });
  }
};
