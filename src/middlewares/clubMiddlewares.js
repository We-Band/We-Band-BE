import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();

/**동아리 가입여부 검증 */
export const isJoinedClub = async (req, res, next) => {
    try {
        const { clubId } = req.parmas;
        const userId = req.userId;

        const existingMember = await prisma.clubMember.findFirst({
            where: {
                clubId: Number(clubId),
                userId: Number(userId),
            },
        });

        if (existingUser) {
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

export const isClubExist = async (req, res, next) => {
    try {
        const { clubId } = req.params;

        const club = await prisma.club.findUnique({
            where: { id: Number(clubId) },
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
};