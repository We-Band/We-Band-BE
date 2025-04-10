import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";
import { clubRepository } from "../repositories/clubRepository.js";
const prisma = new PrismaClient();

// 동아리 존재 여부 검증 미들웨어
export const verifyClub = async (req, res, next) => {
  try {
    const { clubId } = req.params;

    //동아리 존재 여부 검증
    const club = getClubById(clubId);

    if (!club) {
      logger.debug(`존재하지 않는 동아리 입니다 ${clubId}`);
      return res.status(404).json({ message: "존재하지 않는 동아리입니다." });
    }

    ///club객체를 생성해서 다음 미들웨어, 컨트롤러로 보냄
    req.club = club;

    logger.debug(`동아리 존재 여부 검증 완료, ${clubId}`);
    next();
  } catch (error) {
    logger.error(`동아리 존재 여부 검증 실패${error.message}`, { error });
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};

//회장 확인
export const isLeader = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.user_id;
    const clubLeader = req.club.club_leader;

    if (clubLeader !== userId) {
      logger.debug("동아리 회장이 아닙니다");
      return res
        .status(401)
        .json({ message: "해당 기능에 접근할 권한이 없습니다." });
    }

    logger.debug("동아리 회장 검증 완료", { clubId }, { userId });
    next();
  } catch (error) {
    logger.error(`회장 검증 과정 중 실패: ${error.message}`, { error });
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};

export const isClubMember = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const userIdFromBody = req.body;
    const userIdFromToken = req.user.user_id;
    const route = req.route.path;

    let userId;
    if (route.includes("kick-member")) {
      userId = userIdFromBody;
    } else if (route.includes("leave")) {
      userId = userIdFromToken;
    } else {
      return res.status(400).json({ message: "지원하지 않는 요청입니다." });
    }

    const isClubMember = await clubRepository.isMember({
      userId,
      clubId,
    });
    if (isClubMember) {
      logger.debug("동아리원 검증 완료");
    } else {
      logger.debug("동아리에 속한 유저가 아닙니다.");
    }
  } catch (error) {
    logger.error(`동아리 검증 과정 중 실패 ${error.message}`, { error });
    return res.status(500).json({ messae: "서버 오류 발생" });
  }
};
