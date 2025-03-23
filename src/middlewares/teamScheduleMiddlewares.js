import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();


export const isMyTeam = async (req, res, next) => {
    try {
        const { teamId } = req.params.teamId
        const userId = req.user.user_id;

        const TeamMember = await prisma.teamMember.findFirst({
            where: { 
                team_id: Number(teamId),
                user_id: Number(userId)
            }
        });

        if (!TeamMember) {
            logger.info(`요청한 팀에 속하지 않았습니다, ${teamId}`);
            return res.status(400).json({ message: "해당 팀 일정에 접근 권한이 없습니다." });
        }

        logger.info(`팀 일정 여부 검증 완료", certified user: ${ teamId, userId }`);
        next();
    } catch (error) {
        logger.error(`팀 일정 여부 검증 과정 중 실패: ${error.message}`, { error });
        return res.status(500).json({ message: "서버 오류 발생" });
    }
};