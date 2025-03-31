import express from "express"; 
import { logger } from "../utils/logger.js";  
import { PrismaClient } from "@prisma/client";
const router = express.Router();

const prisma = new PrismaClient();



export const viewTeamSchedule = async (req, res) => {
    try {
        const { clubId, teamId } = req.params;
        const { day } = req.query;

        //날짜를 주 단위로 요청
        const inputDate = new Date(day);
        const dayOfWeek = inputDate.getDay();
        const startDate = new Date(inputDate);
        startDate.setDate(inputDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // 월요일 찾기
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        //teamSchedules에 보낼 정보 선택
        const teamSchedules = await prisma.teamSchedule.findMany({
            where: {
                team_id: Number(teamId),
                team_schedule_start: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            select: {
                team_schedule_id: true,
                team_schedule_start: true,
                team_schedule_end: true,
                team_schedule_title: true,
            },
            orderBy: {
                team_schedule_start: 'asc',
            }
        });

        logger.debug("팀 주간 일정을 보냈습니다.");
        return res.json(teamSchedules);

    } catch (error) {
        logger.error(`팀 일정 정보 조회 중 오류 발생: ${error.message}`, error);
        return res.status(500).json({ message: "팀 주간 일정 조회 중 오류가 발생했습니다." });
    }
};


export const viewDetailTeamSchedule = async (req, res) => {
    try {
        const { clubId, teamId, teamScheduleId } = req.params
        const teamSchedule = req.teamSchedule;

        const { team_schedule_start, 
            team_schedule_end, 
            team_schedule_title,    
            team_schedule_place,
            team_participants, 
        } = teamSchedule;

        // 응답으로 필요한 필드만 보냄
        const result = {
            team_schedule_start, 
            team_schedule_end, 
            team_schedule_title,    
            team_schedule_place,
            team_participants, 
        };
    
        logger.debug(`팀 일정 정보를 보냈습니다., ${ teamScheduleId }`);
        return res.json(result);
    } catch (error) {
        logger.error(`팀 일정 정보 조회 중 오류 발생: ${error.message}`, error);
        return res.status(400).json({ message: "팀 일정 조회 중 오류가 발생했습니다."});
    }
};

//동아리 일정 추가 (POST /clubs/:clubId/clubSchdule)
export const addTeamSchedule = async (req, res) => {
    try {
        const { clubId, teamId } = req.params;
        const { teamScheduleStart, teamScheduleEnd, teamScheduleTitle, teamSchedulePlace, teamParticipants } = req.body;

        //동아리 일정 데이터베이스에 추가
        const newTeamSchedule = await prisma.teamSchedule.create({
            data: {
                team_id: Number(clubId),
                team_schedule_start: new Date(teamScheduleStart),
                team_schedule_end: new Date(teamScheduleEnd),
                team_schedule_title: teamScheduleTitle,
                team_schedule_place: teamSchedulePlace || "",
                team_participants: teamParticipants || ""
            }
        });

        logger.debug('팀 일정이 추가 됐습니다.')
        return res.status(201).json(newTeamSchedule);
    } catch (error) {
        logger.error('팀 일정 추가 중 오류 발생:', error);
        return res.status(500).json({ message: "팀 일정 추가 중 오류 발생" });
    }
};

//동아리 일정 삭제 API (DELETE /clubs/:clubId/clubSchdule/:clubScheduleId)
export const deleteTeamSchedule = async (req, res) => {
    try {
        const { clubId, teamId, teamScheduleId } = req.params;

        //동아리 일정 삭제
        await prisma.teamSchedule.delete({
            where: { team_schedule_id: Number(teamScheduleId) }
        });

        logger.debug('팀 일정이 삭제 됐습니다.', { teamScheduleId });
        return res.status(200).json({ message: "팀 일정이 삭제되었습니다." });
    } catch (error) {
        logger.error('팀 일정 삭제 중 오류 발생:', error);
        return res.status(500).json({ message: "팀 일정 삭제 중 오류 발생" });
    }

};

//동아리 일정 수정 API (PATCH /clubs/:clubId/clubSchedule/:clubScheduld)
export const modifyTeamSchedule = async (req, res) => {
    try {
        const { clubId, teamId } = req.params;
        const { teamScheduleStart, teamScheduleEnd, teamScheduleTitle, teamSchedulePlace, teamParticipants } = req.body;

        //동아리 일정 데이터베이스에 추가
        const updatedTeamSchedule = await prisma.teamSchedule.update({
            data: {
                team_id: Number(clubId),
                team_schedule_start: new Date(teamScheduleStart),
                team_schedule_end: new Date(teamScheduleEnd),
                team_schedule_title: teamScheduleTitle,
                team_schedule_place: teamSchedulePlace || "",
                team_participants: teamParticipants || ""
            }
        });

        logger.debug('팀 일정이 수정되었습니다.');
        return res.status(200).json(updatedTeamSchedule);
    } catch (error) {
        logger.error('팀 일정 수정 중 오류 발생:', error);
        return res.status(500).json({ message: "팀 일정 수정 중 오류 발생" });
    }
};

