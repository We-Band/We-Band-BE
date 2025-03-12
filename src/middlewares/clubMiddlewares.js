import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();

//동아리 가입여부 검증 
export const isJoinedClub = async (req, res, next) => {
    try {
        const { clubId } = req.params;
        const userId = req.user.user_id;
        
        //clubMember 테이블에서 동아리 가입여부 검증
        const existingMember = await prisma.clubMember.findFirst({
            where: {
                club_id: Number(clubId),
                user_id: Number(userId),
            },
        });

        if (!existingMember) {
            logger.info("동아리에 가입하지 않은 사용자 입니다.");
            return res.status(409).json({ message: "동아리에 가입되지 않은 사용자입니다."})
        }

        logger.info("가입 여부 검증 완료");
        next();
    } catch(error) {
        logger.error(`동아리 가입 여부 검증 실패${error.message}`, { error } );
        return res.status(500).json({ message: "서버 오류 발생" });
    }
};



//동아리 가입 여부 검증(동아리 탈퇴, 추방시)
export const isUserJoinedClub = async (req, res, next) => {
    try {
        const { clubId } = req.params;
        const { userId } = req.body;
        
        //clubMember 테이블에서 동아리 가입여부 검증
        const existingMember = await prisma.clubMember.findFirst({
            where: {
                club_id: Number(clubId),
                user_id: Number(userId),
            },
        });

        if (!existingMember) {
            logger.info("동아리에 가입하지 않은 사용자 입니다.");
            return res.status(409).json({ message: "동아리에 가입되지 않은 사용자입니다."})
        }

        logger.info("가입 여부 검증 완료");
        next();
    } catch(error) {
        logger.error(`동아리 가입 여부 검증 실패${error.message}`, { error } );
        return res.status(500).json({ message: "서버 오류 발생" });
    }
};

//회장 확인
export const isLeader = async (req, res, next) => {
    try {
        const { clubId } = req.params;  
        const userId = req.user.user_id;

        //club 테이블에서 동아리 회장여부 확인
        const isUserLeader = await prisma.club.findFirst({
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
        logger.error(`회장 검증 과정 중 실패: ${error.message}`, { error });
        return res.status(500).json({ message: "서버 오류 발생" });
    }
};