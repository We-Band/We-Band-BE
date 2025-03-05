import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();

//동아리 가입여부 검증 
export const isJoinedClub = async (req, res, next) => {
    try {
        const { clubId } = req.params;
        const userId = req.userId;

        const existingMember = await prisma.clubMember.findFirst({
            where: {
                club_id: Number(clubId),
                user_id: Number(userId),
            },
        });

        if (existingMember) {
            logger.info("이미 가입된 동아리", { clubId }, { userId });
            return res.status(409).json({ message: "이미 가입된 동아리입니다." });
        }

        logger.info("동아리 가입 여부 검증 완료", { clubId }, { userId });
        next();
    } catch (error) {
        logger.error(`동아리 가입 여부 검증 실패: ${error.message}`, { error });
        return res.status(500).json({ message: "서버 오류 발생" });
    }
};

/**동아리 존재여부 검증 
export const isClubExist = async (req, res, next) => {
    try {
        const { clubId } = req.params;

        const club = await prisma.club.findUnique({
            where: { club_id: Number(clubId) },
        });

        if (!club) {
            logger.info(`존재하지 않는 동아리 ID: ${clubId}`);
            return res.status(404).json({ message: "해당 동아리가 존재하지 않습니다." });
        }

        logger.info("동아리 존재 여부 검증 완료", { clubId });
        next();
    } catch (error) {
        logger.error(`동아리 존재 여부 검증 실패: ${error.message}`, { error });
        return res.status(500).json({ message: "서버 오류 발생" });
    }
}; 동아리 가입여부 따질때 이미 동아리 존재여부 검증을 해야하니 주석처리 */

//추방할 사용자 동아리 가입 여부 검증
export const isUserJoinedClub = async (req, res, next) => {
    try {
        const { clubId } = req.params;
        const { userId } = req.body;

        const existingMember = await prisma.clubMember.findFirst({
            where: {
                club_id: Number(clubId),
                user_id: Number(userId),
            },
        });

        if (!existingUser) {
            logger.info("동아리에 가입하지 않은 사용자 입니다.");
            return res.status(409).json({ message: "동아리에 가입되지 않은 사용자입니다."})
        }

        logger.info("내보낼 회원 동아리 가입 여부 검증 완료");
        next();
    } catch(error) {
        logger.error(`내보낼 회원 동아리 가입 여부 검증 실패`);
        return res.status(500).json({ message: "서버 오류 발생" });
    }
};

export const isLeader = async (req, res, next) => {
    try {
        const { clubId } = req.params;
        const { userId } = req.body;

        const isUserLeader = await prisma.club.findUnique({
            where: {
                club_id: Number(clubId),
                club_leader: Number(userId),
            },
        });

        if (!isUserLeader) {
            logger.info("동아리 회장이 아닙니다", { clubId }, { userId });
            return res.status(401).json({ message: "해당 기능에 접근할 권한이 없습니다." });
        }

        logger.info("동아리 회장 검증 완료", { clubId }, { userId });
        next();
    } catch (error) {
        logger.error(`회장 검증 과정 실패: ${error.message}`, { error });
        return res.status(500).json({ message: "서버 오류 발생" });
    }
};