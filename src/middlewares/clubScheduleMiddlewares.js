import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

export const prisma = new PrismaClient();

export const verifyClubSchedule = async (req, res, next) => {
    try {
        const { clubId, clubScheduleId } = req.params;

        const clubSchedule = await prisma.clubSchedule.findUnique({
            where: {
                club_schedule_id: Number(clubScheduleId)
            }
        });

        if (!clubSchedule) {
            logger.debug("존재하지 않는 동아리 일정");
            return res.status(404).json({ message: "동아리 일정을 찾을 수 없습니다." });
        }
        
        req.clubSchedule = clubSchedule;
        next();
    } catch (error) {
        logger.error(`동아리 일정 존재 여부 검증 실패: ${error.message}`, { error });
        return res.status(500).json({ message: "동아리 일정 존재 여부 검증 중 오류 발생" });
    }
};

export const isMissingClubSchedule = async (req, res, next) => {
        try {  
            const { clubScheduleStart, clubScheduleEnd, clubScheduleTitle } = req.body;

            //일정 시간, 제목은 필수로 들어가야함
            if (!clubScheduleStart && !clubScheduleEnd) {
                logger.debug("동아리 일정 시간 누락");
                return res.status(400).json({ message: "동아리 일정 시간이 누락되었습니다." });
            }

            if (!clubScheduleTitle) {
                logger.debug("동아리 일정 제목 누락");
                return res.status(400).json({ message: "동아리 일정 제목이 누락되었습니다." });
            }
            next();   
        }catch(error) {
            logger.error(`동아리 일정 누락 검증 실패: ${error.message}`, { error });
            return res.status(500).json({ message: "동아리 일정 누락 검증 중 오류 발생" });
        }
};
    
export const isConflictSchedule = async (req, res, next) => {
    try {
        const { clubId, clubScheduleId } = req.params;
        const { clubScheduleStart, clubScheduleEnd } = req.body;

        const startDate = new Date(clubScheduleStart);
        const endDate = new Date(clubScheduleEnd);

        // clubScheduleStart 날짜의 시작(자정)과 끝(23:59:59) 계산 (하루 단위)
        const startOfDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
        const endOfDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 23, 59, 59);

        // 해당 날에 속하면서, 지정한 시간 범위와 겹치는 일정 검색
        const conflictSchedule = await prisma.clubSchedule.findFirst({
            where: {
                club_id: Number(clubId),
                AND: [
                    { club_schedule_start: { gte: startOfDay, lt: endOfDay } },
                    { club_schedule_end: { gt: startDate } },
                    { club_schedule_start: { lt: endDate } }
                ]
            }
        });

        if (conflictSchedule) {
            logger.debug("이 시간대에는 이미 일정이 존재합니다.");
            return res.status(400).json({ message: "이 시간대에는 이미 일정이 존재합니다." });
        }
        next(); 
    } catch (error) {
        logger.error(`동아리 일정 중복 검증 과정 중 실패: ${error.message}, { error }`);
        return res.status(500).json({ message: "동아리 일정 중복 검증 과정 중 오류 발생" });
    }
}; 