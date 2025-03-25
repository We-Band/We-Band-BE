import express from "express"; 
import { logger } from "../utils/logger.js";  
import { PrismaClient } from "@prisma/client";
const router = express.Router();

const prisma = new PrismaClient();

/* 월간 or 주간 동아리 일정 조회 API (GET /clubs/:clubId/clubSchedule?month=2025-03) 
or (GET /clubs/:clubId/clubSchedule?week=2025-03-10) */
export const viewClubSchedule = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { month, week } = req.query;

        //월간 일정 조회 
        if (month) {

            //날짜를 월 단위로 요청
            const startDate = new Date(`${month}-01`);
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

            //clubSchedules에 보낼 정보 선택
            const clubSchedules = await prisma.clubSchedule.findMany({
                where: {
                    club_id: Number(clubId),
                    club_schedule_start: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                select: {
                    club_schedule_id: true,
                    club_schedule_start: true
                },
                orderBy: {
                    club_schedule_start: 'asc'
                }
            });

            logger.info('동아리 월간 일정을 보냈습니다.', { clubScheduleIds: clubSchedules.map(s => s.club_schedule_id) });
            return res.json(clubSchedules);
        }

        //주간 일정 조회
        if (week) {

            //날짜를 주 단위로 요청
            const inputDate = new Date(week);
            const dayOfWeek = inputDate.getDay();
            const startDate = new Date(inputDate);
            startDate.setDate(inputDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // 월요일 찾기
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);

            //clubSchedules에 보낼 정보 선택
            const clubSchedules = await prisma.clubSchedule.findMany({
                where: {
                    club_id: Number(clubId),
                    club_schedule_start: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                select: {
                    club_schedule_id: true,
                    club_schedule_start: true,
                    club_schedule_end: true,
                    club_schedule_title: true
                },
                orderBy: {
                    club_schedule_start: 'asc',
                    club_schedule_end: 'asc'
                }
            });

            logger.info('동아리 주간 일정을 보냈습니다.', { clubScheduleIds: clubSchedules.map(s => s.club_schedule_id) });
            return res.json(clubSchedules);
        }

        // month, week 둘 다 없는 경우
        logger.error('요청한 query string이 없습니다.')
        return res.status(400).json({ message: "조회할 기간을 지정하세요 (month 또는 week)" });

    } catch (error) {
        logger.error('서버 실행 중 오류 발생', error);
        return res.status(500).json({ message: "서버 실행 중 오류 발생" });
    }
}; //조회하고 싶은 일정 선택시 /clubs/:clubId/:clubScheduleId로 url 보내기


//동아리 일정 정보 조회 API (GET /clubs/:clubId/clubSchedule/:clubScheduleId) 
export const viewDetailClubSchedule = async (req, res) => {
    try {
        const { clubId, clubScheduleId } = req.params

        //사용자 화면에 띄울 동아리 일정 정보 보냄
        const clubSchedules = await prisma.clubSchedule.findUnique({
            where: {
                club_id: Number(clubId),
                club_schedule_id: Number(clubScheduleId)
            },
            select: {
                club_schedule_time: true,
                club_schedule_title: true,
                club_schedule_place: true
            }
        });
        
        logger.info('동아리 일정 정보를 보냈습니다.', { clubScheduleId });
        return res.json(clubSchedules);

    } catch (error) {
        logger.error('서버 실행 중 오류 발생', error);
        return res.status(400).json({ message: "서버 실행 중 오류 발생"})
    }
};

//동아리 일정 추가 (POST /clubs/:clubId/clubSchdule)
export const addClubSchedule = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { clubScheduleStart, clubScheduleEnd, clubScheduleTitle, clubSchedulePlace } = req.body;

        //일정 시간, 제목은 필수로 들어가야함
        if (!clubScheduleStart && clubScheduleEnd) {
            return res.status(400).json({ message: "동아리 일정 시간을 입력하세요." });
        }

        if (!clubScheduleTitle) {
            return res.status(400).json({ message: "동아리 일정 제목을 입력하세요." });
        }

        //동아리 일정 데이터베이스에 추가
        const newClubSchedule = await prisma.clubSchedule.create({
            data: {
                club_id: Number(clubId),
                club_schedule_start: new Date(clubScheduleStart),
                club_schedule_end: new Date(clubScheduleEnd),
                club_schedule_title: clubScheduleTitle,
                club_schedule_place: clubSchedulePlace || "no place"
            }
        });

        logger.info('동아리 일정이 추가 됐습니다.')
        return res.status(201).json(newClubSchedule);
    } catch (error) {
        logger.error('동아리 일정 추가 중 오류 발생:', error);
        return res.status(500).json({ message: "동아리 일정 추가 중 오류 발생" });
    }
};

//동아리 일정 삭제 API (DELETE /clubs/:clubId/clubSchdule/:clubScheduleId)
export const deleteClubSchedule = async (req, res) => {
    try {
        const { clubId, clubScheduleId } = req.params;

        //동아리 일정 삭제
        await prisma.clubSchedule.delete({
            where: { club_schedule_id: Number(clubScheduleId) }
        });

        logger.info('동아리 일정이 삭제 됐습니다.', { clubScheduleId });
        return res.status(200).json({ message: "동아리 일정이 삭제되었습니다." });
    } catch (error) {
        logger.error('동아리 일정 삭제 중 오류 발생:', error);
        return res.status(500).json({ message: "동아리 일정 삭제 중 오류 발생" });
    }
};

//동아리 일정 수정 API (PATCH /clubs/:clubId/clubSchedule/:clubScheduld)
export const modifyClubSchedule = async (req, res) => {
    try {
        const { clubId, clubScheduleId } = req.params;
        const { clubScheduleStart, clubScheduleEnd, clubScheduleTitle, clubSchedulePlace } = req.body;

        //동아리 일정 수정 (부분 수정)
        const updatedClubSchedule = await prisma.clubSchedule.update({
            where: { club_schedule_id: Number(clubScheduleId) },
            data: {
                club_id: Number(clubId),
                club_schedule_start: new Date(clubScheduleStart),
                club_schedule_end: new Date(clubScheduleEnd),
                club_schedule_title: clubScheduleTitle,
                club_schedule_place: clubSchedulePlace || "no place"
            }
        });

        logger.info('동아리 일정이 수정되었습니다.');

        return res.status(200).json(updatedClubSchedule);
    } catch (error) {
        logger.error('동아리 일정 수정 중 오류 발생:', error);
        return res.status(500).json({ message: "동아리 일정 수정 중 오류 발생" });
    }
};

