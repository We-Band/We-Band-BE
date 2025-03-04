import express from "express";
import { prisma } from "../utils/prisma.js"; 
import { logger } from "../utils/logger.js";
import { authenticateUser } from "../middlewares/authMiddlewares.js";   
const router = express.Router();

export const joinClub = async (req, res) => {
    try {
        const { clubId } = req.params; 
        const { clubCode } = req.body; 
        const userId = req.userId;

        if (!clubCode) {
            logger.info("가입 코드 누락");
            return res.status(400).json({ message: "가입 코드를 입력해주세요." });
        }

        //가입코드 검증
        if (club.club_code !== clubCode) {
            logger.info(`잘못된 동아리 코드 입력: ${clubCode} (정답: ${club.club_code})`);
            return res.status(400).json({ message: "잘못된 동아리 코드입니다." });
        }

        //가입 여부 확인
        const existingMember = await prisma.clubMember.findFirst({
            where: {
                clubId: Number(clubId),
                userId: Number(userId),
            },
        });

        if (existingMember) {
            logger.info(`이미 가입한 클럽에 가입시도: ${club.name}(${clubId})`);
            return res.status(400).json({ message: "이미 가입한 클럽입니다." });
        }

        //clubMember 테이블에 사용자 추가
        await prisma.clubMember.create({
            data: {
                clubId: Number(clubId),
                userId: Number(userId),
            },
        });

        //가입인원 수 증가
        await prisma.club.update({
            where: { id: Number(clubId) },
            data: {
                member_count: { increment: 1 }, // 인원 + 1
            },
        });

        logger.info(`사용자 ${userId}가 동아리 ${club.name}에 가입함`);
        return res.status(200).json({ message: "클럽 가입 성공" });

    } catch (error) {
        logger.error(`클럽 가입 중 오류 발생: ${error.message}`);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};
