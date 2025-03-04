import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();

/**회원 가입여부 검증 */
export const isJoined = async (req, res, next) => {
    try {
        const { email } = req.body; 
        
        if (!email) {
            logger.error("필수 입력값이 없습니다.");
            return res.status(400).json({ message: "필수 입력값이 없습니다." });  
        }

        const existingUser = await prisma.weBandUser.findUnique({
            where: { email },
        });

        if (existingUser) {
            logger.info("이미 가입된 회원", { email });
            return res.status(409).json({ message: "이미 가입된 이메일입니다." });
        }  

        logger.info("회원 가입 여부 검증 완료", { email });
        next(); //
    } catch (error) {
        logger.error(`회원 가입 여부 검증 실패: ${error.message}`, { error });
        return res.status(500).json({ message: "서버 오류 발생" });
    }
};