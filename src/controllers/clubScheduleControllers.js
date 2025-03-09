import express from "express"; 
import { logger } from "../utils/logger.js";  
import { PrismaClient } from "@prisma/client";
const router = express.Router();

const prisma = new PrismaClient();

export const viewMonthSchedule = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { date } = req.query
        if (!date) {
            logger.error("조회할 달이 없습니다. ")
            return res.status(400)({ message: "조회할 달이 없습니다." });
        }

        const startDate = new Date(date + "-01");
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

        const schedules = await prisma.clubSchedule.findMany({
            where: {
                club_id: clubId,
                club_schedule_time: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
               club_schedule_id: true, 
               club_schedule_time: true
            },
            orderBy: {
                club_schedule_time: 'asc'
            }
        });
        
        return res.json(schedules);

    } catch (error) {
        logger.error('서버 실행 중 오류 발생');
        return res.status(400).json({ message: "서버 실행 중 오류 발생"})
    }
};//날짜 선택하면 club_schedule_id가 있는 곳으로 url 보내도록 , week에서도 마찬가지

export const viewWeekSchedule = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { date } = req.query
        if (!date) {
            logger.error("조회할 주가 없습니다. ")
            return res.status(400)({ message: "조회할 주가 없습니다." });
        }

        const inputDate = new Date(date);
        const dayOfWeek = inputDate.getDay(); // 0(일) ~ 6(토)
        const startDate = new Date(inputDate);
        startDate.setDate(inputDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // 월요일 찾기
        startDate.setHours(0, 0, 0, 0);
    
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // 일요일 찾기
        endDate.setHours(23, 59, 59, 999);

        const schedules = await prisma.clubSchedule.findMany({
            where: {
                club_id: clubId,
                club_schedule_time: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
               club_schedule_id: true, 
               club_schedule_time: true,
               club_schedule_title: true
            },
            orderBy: {
                club_schedule_time: 'asc'
            }
        });
        
        return res.json(schedules);

    } catch (error) {
        logger.error('서버 실행 중 오류 발생');
        return res.status(400).json({ message: "서버 실행 중 오류 발생"})
    }
};

export const viewDetailchedule = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { scheduleId } = req.query
        if (!scheduleId) {
            logger.error("조회할 동아리 일정이 없습니다. ")
            return res.status(400)({ message: "조회할 동아리 일정이 없습니다." });
        }

        const schedules = await prisma.clubSchedule.findMany({
            where: {
                club_schedule_id: scheduleId
            },
            orderBy: {
                club_schedule_time: 'asc'
            }
        });
        
        return res.json(schedules);

    } catch (error) {
        logger.error('서버 실행 중 오류 발생');
        return res.status(400).json({ message: "서버 실행 중 오류 발생"})
    }
}

export const addSchedule = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { clubScheduleTime, clubScheduleTitle, clubSchedulePlace } = req.body;

        if (!clubScheduleTime) {
            return res.status(400).json({ message: "동아리 일정 시간을 입력하세요." });
        }

        const newSchedule = await prisma.clubSchedule.create({
            data: {
                club_id: Number(clubId),
                club_schedule_time: new Date(clubScheduleTime),
                club_schedule_title: clubScheduleTitle || null,
                club_schedule_place: clubSchedulePlace || null
            }
        });
        logger.info('동아리 일정이 추가 됐습니다.')

        return res.status(201).json(newSchedule);
    } catch (error) {
        logger.error('동아리 일정 추가 중 오류 발생:', error);
        return res.status(500).json({ message: "동아리 일정 추가 중 오류 발생" });
    }
};

export const deleteSchedule = async (req, res) => {
    try {
        const { clubScheduleId } = req.params;

        const existingSchedule = await prisma.clubSchedule.findUnique({
            where: { club_schedule_id: Number(clubScheduleId) }
        });
    
        if (!existingSchedule) {
            logger.info('동아리 일정이 존재하지 않음', {clubScheduleId});
            return res.status(404).json({ message: "해당 동아리 일정을 찾을 수 없습니다." });
        }

        // 스케줄 삭제
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

export const modifySchedule = async (req, res) => {
    try {
        const { clubScheduleId } = req.params;
        const { clubScheduleTime, clubScheduleTitle, clubSchedulePlace } = req.body;

        //이부분 middleware로 모듈화 시킬려고 했으나 controller에 포함하는게 효율이 좋아서 유지
        const existingSchedule = await prisma.clubSchedule.findUnique({
            where: { club_schedule_id: Number(clubScheduleId) }
        });

        if (!existingSchedule) {
            logger.info('동아리 일정이 존재하지 않음', {clubScheduleId});
            return res.status(404).json({ message: "해당 동아리 일정을 찾을 수 없습니다." });
        }

        // 스케줄 수정 (부분 업데이트)
        const updatedSchedule = await prisma.clubSchedule.update({
            where: { club_schedule_id: Number(scheduleId) },
            data: {
                club_schedule_time: clubScheduleTime ? new Date(clubScheduleTime) : existingSchedule.club_schedule_time,
                club_schedule_title: clubScheduleTitle ?? existingSchedule.club_schedule_title,
                club_schedule_place: clubSchedulePlace ?? existingSchedule.club_schedule_place
            }
        });

        logger.info('동아리 일정이 수정되었습니다.');

        return res.status(200).json(updatedSchedule);
    } catch (error) {
        logger.error('동아리 일정 수정 중 오류 발생:', error);
        return res.status(500).json({ message: "동아리 일정 수정 중 오류 발생" });
    }
};

