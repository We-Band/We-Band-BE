import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();

/**이미 회원가입 여부 검증 */
export const isJoined = async (req, res, next) => {
    try {
        const { email } = req.body;

        const existingUser = await prisma.weBandUser.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({ message: "이미 가입된 이메일입니다." });
        }  

        logger.info("회원 가입 여부 검증 완료", { email });
        next(); //
    } catch (error) {
        logger.error(`회원 가입 여부 검증 실패: ${error.message}`, { error });
        return res.status(500).json({ message: "서버 오류 발생" });
    }
};
