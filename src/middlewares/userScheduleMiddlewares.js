import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();


export const isMine = async (req, res, next) => {
    try {
        const { userId } = req.params
        const myId = req.user.user_id;

        //접속한 일정이 내 일정하고 같은지 확인
        if (Number(userId) !== myId) {
            logger.info(`기능에 접근할 수 없습니다, approached user: ${ myId }`);
            return res.status(401).json({ message: '해당 기능에 접근할 권한이 없습니다.' });
        }

        logger.info(`사용자 일정 검증 완료", certified user: ${ myId }`);
        next();
    } catch (error) {
        logger.error(`사용자 일정 검증 과정 중 실패: ${error.message}`, { error });
        return res.status(500).json({ message: "서버 오류 발생" });
    }
};
