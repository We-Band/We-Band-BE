import express from "express"; 
import { logger } from "../utils/logger.js";  
const router = express.Router();

// 동아리 가입 API (POST /clubs/:clubId/join)
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

        //clubMember 테이블에 사용자 추가
        await prisma.clubMember.create({
            data: {
                club_id: Number(clubId),
                user_id: Number(userId),
            },
        });

        //가입인원 수 증가
        await prisma.club.update({
            where: { club_id: Number(clubId) },
            data: {
                member_count: { increment: 1 }, // 인원 + 1
            },
        });

        logger.info(`사용자 ${userId}가 동아리 ${club.club_name}에 가입함`);
        return res.status(200).json({ message: "동아리 가입 성공" });

    } catch (error) {
        logger.error(`동아리 가입 중 오류 발생: ${error.message}`);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};


//동아리 탈퇴 API (DELETE /clubs/:clubId)
export const quitClub = async (req, res) => {
    try {
        const { clubId } = req.parmas;
        const userId = req.userId;

        //clubMember 테이블에 사용자 삭제
        await prisma.clubMember.delete({
            data: {
                club_id: Number(clubId),
                user_id: Number(userId),
            },
        });

        logger.info(`사용자 ${userId}가 동아리 ${club.name}에 탈퇴 했습니다.`);
        return res.status(200).json({ message: "동아리 탈퇴 성공 "});
    } catch(error) {
        logger.error(`동아리 탈퇴 중 오류 발생: ${error.message}`);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

//동아리 추방API (DELETE /clubs/:clubId/kick)
export const kickMember = async (req, res) => {
    try {
        const { clubId } = req.parmas;
        const userId = req.userId;

        //clubMember 테이블에 사용자 삭제
        await prisma.clubMember.delete({
            data: {
                club_id: Number(clubId),
                user_id: Number(userId),
            },
        });

        logger.info(`사용자 ${userId}를 동아리 ${club.name}에서 내보냈습니다.`);
        return res.status(200).json({ message: "동아리 퇴출 성공 "});
    } catch(error) {
        logger.error(`동아리 퇴출 중 오류 발생: ${error.message}`);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

//동아리 가입 코드 수정 API (POST /clubs/:clubId/setting)
export const changeCode = async (req, res) => {
    try {
        const { clubId } = req.parmas;
        const { newCode } = req.body;

        if (!newCode) {
            logger.info("변경할 동아리 코드 누락");
            return res.status(400).json({ messsage: "가입 코드를 입력해주세요. "});
        }

        await prisma.club.update({
            where: { club_id: Number(clubId) },
            data: {
                club_code: { newCode },
            },
        });

        logger.info(`동아리 ${club.club_name}에 가입 코드가 변경 되었습니다.`);
        return res.status(200).json({ message: "동아리 가입 코드가 수정 되었습니다."});
    } catch (error) {
        logger.error(`동아리 코드 변경 중 오류 발생: ${error.message}`);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

//동아리 회장 변경 API (PATCH /clubs/:clubId/leader)
export const changeLeader = async (req, res) => {
    try {
        const { clubId } = req.parmas;
        const { newLeader} = req.body;

        if (!newLeader) {
            logger.info("새로 임명할 회장 누락");
            return res.status(400).json({ messsage: "회장으로 임명할 사용자를 선택해주세요."});
        }

        await prisma.club.update({
            where: { club_id: Number(clubId) },
            data: {
                club_leader: { newLeader },
            },
        });
        logger.info(`동아리 ${club.club_name}에 회장이 ${club.club_leader}로 변경되었습니다.`);
        return res.status(200).json({ message: "동아리 회장이 변경 되었습니다." });
    } catch (error) {
        logger.error(`동아리 회장 변경 중 오류 발생: ${error.message}`);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};