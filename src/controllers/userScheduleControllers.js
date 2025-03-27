import express from "express"; 
import { logger } from "../utils/logger.js";  
import { PrismaClient } from "@prisma/client";

const router = express.Router();

export const prisma = new PrismaClient();

/* 월간 or 주간 사용자 일정 조회 API (GET /user/:userId/userSchedule?month=2025-03) 
or (GET /user/:userId/userSchedule?week=2025-03-10) */
export const viewUserSchedule = async (req, res) => {
    try {
        const { userId } = req.params;
        const { month, week } = req.query;
        const myId = req.user.user_id;

        //월간 일정 조회 
        if (month) {

            //날짜를 월 단위로 요청
            const startDate = new Date(`${month}-01`);
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

            //clubSchedules에 보낼 정보 선택
            const userSchedules = await prisma.userSchedule.findMany({
                where: {
                    user_id: Number(userId),
                    user_schedule_stasrt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                select: {
                    user_schedule_id: true,
                    user_schedule_start: true,
                },
                orderBy: {
                    user_schedule_start: 'asc'
                }
            });

            logger.info('사용자 월간 일정을 보냈습니다.', { userScheduleIds: userSchedules.map(s => s.user_schedule_id) });
            return res.json(userSchedules);
        }

        //주간 일정 조회
        if (week) {

            //날짜를 주 단위로 요청
            const inputDate = new Date(week);
            const dayOfWeek = inputDate.getDay();
            const startDate = new Date(inputDate);
            startDate.setDate(inputDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // 월요일을 한주의 시작으로 설정
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);

            //clubSchedules에 보낼 정보 선택
            const userSchedules = await prisma.userSchedule.findMany({
                where: {
                    user_id: Number(userId),
                    user_schedule_start: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                select: {
                    user_schedule_id: true,
                    user_schedule_start: true,
                    user_schedule_end: true,
                    user_schedule_title: true,
                    is_public: true
                },
                orderBy: {
                    user_schedule_start: 'asc',
                    user_schedule_end: 'asc'
                }
            });

            //사용자 페이지와 접속한 사용자 id가 같아야지만 비공개 일정을 확인 가능
            if (Number(userId) !== Number(myId) && userSchedules.is_public ) {
                userSchedules.user_schedule_title = "비공개 일정";
            }

            logger.info('사용자 월간 일정을 보냈습니다.', { userScheduleIds: userSchedules.map(s => s.user_schedule_id) });
            return res.json(userSchedules);
        }

        // month, week 둘 다 없는 경우
        logger.error('요청한 query string이 없습니다.')
        return res.status(400).json({ message: "조회할 기간을 지정하세요 (month 또는 week)" });

    } catch (error) {
        logger.error('서버 실행 중 오류 발생', error);
        return res.status(500).json({ message: "서버 실행 중 오류 발생" });
    }
}; //조회하고 싶은 일정 선택시 /user/:userId/:userScheduleId로 url 보내기


//사용자 일정 정보 조회 API (GET /user/:userId/userSchedule/:userScheduleId) 
export const viewDetailUserSchedule = async (req, res) => {
    try {
        const { userId, userScheduleId } = req.params
        const myId = req.userId;
        const userSchedule = req.userSchedule;

        const { user_schedule_start, 
            user_schedule_end, 
            user_schedule_title,    
            user_schedule_place,
            is_public 
        } = userSchedule;

        // 응답으로 필요한 필드만 보냄
        const result = {
            user_schedule_start,
            user_schedule_end,
            user_schedule_title,
            user_schedule_place
        };
        
        //비공개 일정시 자세한 내용 숨기기(시간대만 알 수 있음)
        if (Number(userId) !== Number(myId) && is_public ) {
            user_schedule_title = "비공개 일정";
            user_schedule_place = "비공개 장소";
        }

        logger.debug(`사용자 일정 정보를 보냈습니다., ${ userScheduleId }`);
        return res.json(result);

    } catch (error) {
        logger.error('서버 실행 중 오류 발생', error);
        return res.status(400).json({ message: "서버 실행 중 오류 발생"})
    }
};

//사용자 일정 추가 (POST /user/:userId/userSchdule)
export const addUserSchedule = async (req, res) => {
    try {
        const { userId } = req.params;
        const { userScheduleStart, userScheduleEnd, userScheduleTitle, userSchedulePlace, isPublic } = req.body;

        //사용자 일정 데이터베이스에 추가
        const newUserSchedule = await prisma.userSchedule.create({
            data: {
                user_id: Number(userId),
                user_schedule_start: new Date(userScheduleStart),
                user_schedule_end: new Date(userScheduleEnd),
                user_schedule_title: userScheduleTitle,
                user_schedule_place: userSchedulePlace || "no place",
                is_public: isPublic || true
            }
        });

        logger.info('사용자 일정이 추가 됐습니다.')
        return res.status(201).json(newUserSchedule);
    } catch (error) {
        logger.error('사용자 일정 추가 중 오류 발생:', error);
        return res.status(500).json({ message: "사용자 일정 추가 중 오류 발생" });
    }
};

//사용자 일정 삭제 API (DELETE /user/:userId/userSchdule/:userScheduleId)
export const deleteUserSchedule = async (req, res) => {
    try {
        const { userScheduleId } = req.params;

        //사용자 일정 삭제
        await prisma.userSchedule.delete({
            where: { user_schedule_id: Number(userScheduleId) }
        });

        logger.info('사용자 일정이 삭제 됐습니다.', { userScheduleId });
        return res.status(200).json({ message: "사용자 일정이 삭제되었습니다." });
    } catch (error) {
        logger.error('사용자 일정 삭제 중 오류 발생:', error);
        return res.status(500).json({ message: "사용자 일정 삭제 중 오류 발생" });
    }
};

//사용자 일정 수정 API (PATCH /user/:userId/userSchedule/:userScheduld)
export const modifyUserSchedule = async (req, res) => {
    try {
        const { userId, userScheduleId } = req.params;
        const { userScheduleTime, userScheduleTitle, userSchedulePlace, isPublic } = req.body;

        //사용자 일정 수정 (부분 수정)
        const updatedUserSchedule = await prisma.userSchedule.update({
            where: { user_schedule_id: Number(userScheduleId) },
            data: {
                user_schedule_time: userScheduleTime ? new Date(userScheduleTime) : existingSchedule.user_schedule_time,
                user_schedule_title: userScheduleTitle ?? existingSchedule.user_schedule_title,
                user_schedule_place: userSchedulePlace ?? existingSchedule.user_schedule_place,
                is_public: isPublic ?? existingSchedule.is_public
            }
        });

        logger.info('사용자 일정이 수정되었습니다.');

        return res.status(200).json(updatedUserSchedule);
    } catch (error) {
        logger.error('사용자 일정 수정 중 오류 발생:', error);
        return res.status(500).json({ message: "사용자 일정 수정 중 오류 발생" });
    }
};
