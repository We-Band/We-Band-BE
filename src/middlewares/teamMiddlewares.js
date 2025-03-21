import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();

//팀장 여부 확인

export const isTeamLeader = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const teamId = req.params.teamId;

        const TeamLeader = await prisma.Team.findFirst({
            where : {
                team_id: Number(teamId),
                created_by: Number(userId)
            }
        });

        if(!TeamLeader){
            logger.info("해당 팀의 팀장이 아닙니다!");
            return res.status(409).json({message: "팀장만이 사용할 수 있는 기능입니다."});
        }

        logger.info("팀장 검증 완료");
        next();

    }
    catch(error){
        logger.error(`팀장 검증 실패${error.message}`, { error } );
        return res.status(500).json({ message: "서버 오류 발생" });
    }
}