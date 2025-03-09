import express from "express"; 
import { logger } from "../utils/logger.js";  
import { PrismaClient } from "@prisma/client";
const router = express.Router();

const prisma = new PrismaClient();

// 동아리 가입 API (POST /clubs)
export const joinClub = async (req, res) => {
    try {
        const { clubCode } = req.body;
        const userId = req.user.user_id;

        if (!clubCode) {
            logger.error("동아리 가입 코드가 제공되지 않았습니다.");
            return res.status(400).json({ message: "동아리 가입 코드가 필요합니다." });
        }

        //club객체 생성
        const club = await prisma.club.findUnique({
            where: { club_code: clubCode },
        });

        // club이 null인 경우 처리
        if (!club) {
            logger.info(`잘못된 동아리 코드 입력: clubCode ${clubCode}`);
            return res.status(404).json({ message: "잘못된 동아리 코드입력" });
        }

        const clubId = club.club_id;

        //동아리 가입 여부 확인
        const existingMember = await prisma.clubMember.findFirst({
            where: {
                club_id: clubId,
                user_id: userId,
            },
        });

        if (existingMember) {
            logger.info("이미 가입된 동아리", { clubId }, { userId });
            return res.status(409).json({ message: "이미 가입된 동아리입니다." });
        }

        // clubMember 테이블에 사용자 추가
        await prisma.clubMember.create({
            data: {
                club_id: Number(clubId),
                user_id: Number(userId),
            },
        });

        // 가입인원 수 증가
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
        const { clubId } = req.params;
        const userId = req.user.user_id;

        //club 객체 생성
        const club = await prisma.club.findUnique({
            where: { club_id: Number(clubId) },
        });
        
        if (!club) {
            return res.status(404).json({ message: "존재하지 않는 동아리입니다." });
        }

        //clubMember 테이블에 사용자 삭제
        await prisma.clubMember.delete({
            where: {
                club_id_user_id: {   // 두 필드를 합친 복합키로 삭제
                    club_id: Number(clubId),
                    user_id: userId,
                },
            },
        });

        logger.info(`사용자 ${userId}가 동아리 ${club.club_name}에 탈퇴 했습니다.`);
        return res.status(200).json({ message: "동아리 탈퇴 성공 "});
    } catch(error) {
        logger.error(`동아리 탈퇴 중 오류 발생: ${error.message}`);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

//동아리 추방API (DELETE /clubs/:clubId/kick)
export const kickMember = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { userId } = req.body;
        const myId = req.user.user_id;

        //club 객체 생성
        const club = await prisma.club.findUnique({
            where: { club_id: Number(clubId) },
        });
        
        if (!club) {
            logger.info(`존재하지 않는 동아리 입니다 ${clubId}`)
            return res.status(404).json({ message: "존재하지 않는 동아리입니다." });
        }

        //추방할 user랑 회장 아이디랑 같으면 추방 불가능
        if ( userId == myId) {
            logger.info('회장은 퇴출할 수 없습니다');
            return res.status(405).json({ message: "회장은 퇴출 불가능합니다."});
        }

        //clubMember 테이블에 사용자 삭제
        await prisma.clubMember.delete({
            where: {
                club_id_user_id: {   // 두 필드를 합친 복합키로 삭제
                    club_id: Number(clubId),
                    user_id: Number(userId),
                },
            },
        });

        logger.info(`사용자 ${userId}를 동아리 ${club.name}에서 내보냈습니다.`);
        return res.status(200).json({ message: "동아리 퇴출 성공 "});
    } catch(error) {
        logger.error(`동아리 퇴출 중 오류 발생: ${error.message}`);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

//동아리 가입 코드 수정 API (PATCH /clubs/:clubId/setting)
export const changeCode = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { newCode } = req.body;

        if (!newCode) {
            console.error("동아리 가입 코드가 제공되지 않았습니다.");
            return res.status(400).json({ message: "동아리 가입 코드가 필요합니다." });
        }

        //club객체 생성
        const club = await prisma.club.findUnique({
            where: { club_id: Number(clubId) },
        });
    
    
        if (!club) {
            logger.info(`동아리 정보 없음: clubId ${clubId}`);
            return res.status(404).json({ message: "존재하지 않는 동아리입니다." });
        }
        
        //가입 코드 변경
        await prisma.club.update({
            where: { club_id: Number(clubId) },
            data: {
                club_code: newCode,
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
        const { clubId } = req.params;
        const { newLeader} = req.body;

        if (!newLeader) {
            logger.info("새로 임명할 회장 누락");
            return res.status(400).json({ messsage: "회장으로 임명할 사용자를 선택해주세요."});
        }
        
        //club 객체 생성
        const club = await prisma.club.findUnique({
            where: { club_id: Number(clubId) },
        });
    
        if (!club) {
            logger.info(`동아리 정보 없음: clubId ${clubId}`);
            return res.status(404).json({ message: "존재하지 않는 동아리입니다." });
        }
        
        //동아리 회장 변경
        await prisma.club.update({
            where: { club_id: Number(clubId) },
            data: {
                club_leader: Number(newLeader),
            },
        });

        logger.info(`동아리 ${club.club_name}에 회장이 ${club.club_leader}로 변경되었습니다.`);
        return res.status(200).json({ message: "동아리 회장이 변경 되었습니다." });
    } catch (error) {
        logger.error(`동아리 회장 변경 중 오류 발생: ${error.message}`);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};