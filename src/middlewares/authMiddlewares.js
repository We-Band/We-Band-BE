import { logger } from "../utils/logger.js";
import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            logger.info("토큰 인증 실패");
            return res.status(401).json({ message: "인증이 필요합니다." });
        }

        // JWT 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId // req.user에 userId 저장

        next();
    } catch (error) {
        logger.error(`토큰인증 중 오류 발생: ${error.message}`, { error });
        return res.status(403).json({ message: "토큰 인증 중 오류 발생"});
    }
}

