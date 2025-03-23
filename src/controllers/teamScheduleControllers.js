import express from "express"; 
import { logger } from "../utils/logger.js";  
import { PrismaClient } from "@prisma/client";

const router = express.Router();

const prisma = new PrismaClient();

/* 월간 or 주간 사용자 일정 조회 API (GET /user/:userId/userSchedule?month=2025-03) 
or (GET /user/:userId/userSchedule?week=2025-03-10) */
export const viewTeamSchedule = async (req, res) => {
    try {
        const { clubId, teamId } = req.params;
        const { month, week } = req.query;
        const myId = req.user.user_id;

        //월간 일정 조회 
        if (month) {

            //날짜를 월 단위로 요청
            const startDate = new Date(`${month}-01`);
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

            //teamSchedules에 보낼 정보 선택
            const teamSchedules = await prisma.teamSchedule.findMany({
                where: {
                    team_id: Number(teamId),
                    user_schedule_time: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                select: {
                    team_schedule_id: true,
                    team_schedule_time: true,
                },
                orderBy: {
                    team_schedule_time: 'asc'
                }
            });

            logger.info('팀 월간 일정을 보냈습니다.', { teamScheduleIds: teamSchedules.map(s => s.team_schedule_id) });
            return res.json(teamSchedules);
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

            //teamSchedules에 보낼 정보 선택
            const teamSchedules = await prisma.teamSchedule.findMany({
                where: {
                    team_id: Number(teamId),
                    user_schedule_time: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                select: {
                    team_schedule_id: true,
                    team_schedule_time: true,
                    Team_schedule_title: true
                },
                orderBy: {
                    team_schedule_time: 'asc'
                }
            });

            logger.info('팀 주간 일정을 보냈습니다.', { teamScheduleIds: teamSchedules.map(s => s.team_schedule_id) });
            return res.json(teamSchedules);
        }

        // month, week 둘 다 없는 경우
        logger.error('요청한 query string이 없습니다.')
        return res.status(400).json({ message: "조회할 기간을 지정하세요 (month 또는 week)" });

    } catch (error) {
        logger.error('서버 실행 중 오류 발생', error);
        return res.status(500).json({ message: "서버 실행 중 오류 발생" });
    }
}; 


//사용자 일정 정보 조회 API (GET /user/:userId/userSchedule/:userScheduleId) 
export const viewDetailTeamSchedule = async (req, res) => {
    try {
        const { clubId, teamId } = req.params
        const { teamScheduleId } =req.params.teamScheduleId

        if (!teamId) {
            logger.error("조회할 팀이 없습니다.")
            return res.status(400)(({ message: "조회할 팀 이 없습니다."}));
        }
        //사용자 일정 정보 존재 여부 검증
        if (!teamScheduleId) {
            logger.error("조회할 팀 일정이 없습니다. ")
            return res.status(400)({ message: "조회할 팀 일정이 없습니다." });
        }

        //사용자 화면에 띄울 사용자 일정 정보 보냄
        const userSchedules = await prisma.userSchedule.findUnique({
            where: {
                team_id: Number(teamId),
                team_schedule_id: Number(teamScheduleId)
            },
            select: {
                team_schedule_time: true,
                team_schedule_title: true,
                team_schedule_place: true,
                team_schedule_participated: true
            }
        });
        


        logger.info('팀 일정 정보를 보냈습니다.', { teamScheduleId });
        return res.json(userSchedules);

    } catch (error) {
        logger.error('서버 실행 중 오류 발생', error);
        return res.status(400).json({ message: "서버 실행 중 오류 발생"})
    }
};

export const getTeamMember = async (req, res) => {
    try {
        const { clubId, teamId } = req.params;

        const teamMemberArray = await prisma.teamMember.findMany({
            where: {
                team_id: Number(teamId)
            }
        })

        const teamMemberNames = await prisma.weBandUser.findMany({
            where: {
                user_id: {
                    in: teamMemberArray.map(member => member.user_id)  // teamMemberArray의 user_id들을 찾아서
                }
            },
            select: {
                user_name: true
            }
        });

        logger.info("팀원 목록 반환");
        return res.status(200).json(teamMemberNames)
        
    }catch(error) {
        logger.info(`서버실행중 오류 발생 ${error}`);
        return res.status(500).json({ message: `서버 실행중 오류 발생: ${error}`});
    }
    
};

//팀 일정 추가 (POST /user/:userId/userSchdule)
export const addTeamSchedule = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { clubId, teamId } = req.params;
        const { teamScheduleTime, teamScheduleTitle, teamSchedulePlace, participatedMembers } = req.body;

        const teamMemberArray = participatedMembers ? participatedMembers.split(",") : [];

        //일정 시간, 제목은 필수로 들어가야함
        if (!teamScheduleTime) {
            return res.status(400).json({ message: "팀 일정 시간을 입력하세요." });
        }

        if (!teamScheduleTitle) {
            return res.status(400).json({ message: "팀 일정 제목을 입력하세요." });
        }

        const startTime = new Date(teamScheduleTime);
        startTime.setMilliseconds(0);
        startTime.setSeconds(0);

        // 30분 단위로 끝나는 시간을 설정
        const endTime = new Date(startTime);
        endTime.setMinutes(Math.ceil(startTime.getMinutes() / 30) * 30 + 30);  // 30분 단위로 올림
        endTime.setSeconds(0)

        const existingSchedule = await prisma.teamSchedule.findFirst({
            where: {
                team_id: Number(teamId),
                team_schedule_time: {
                    gte: startTime,
                    lte: endTime
                }
            }
        });

        //존재하는 일정인지 확인
        if (existingSchedule) {
            logger.info('이미 일정이 존재하는 시간대입니다.')
            return res.status(400).json({ message: "이 시간대에는 이미 일정이 존재합니다." });
        }

        //사용자 일정 데이터베이스에 추가
        const newTeamSchedule = await prisma.teamSchedule.create({
            data: {
                team_id: Number(teamId),
                team_schedule_time: new Date(teamScheduleTime),
                team_schedule_title: teamScheduleTitle,
                team_schedule_place: teamSchedulePlace || "no place",
                team_schedule_participated: teamMemberArray,
                created_by: Number(userId)
            }
        });

        logger.info('팀 일정이 추가 됐습니다.')
        return res.status(201).json(newTeamSchedule);
    } catch (error) {
        logger.error('팀 일정 추가 중 오류 발생:', error);
        return res.status(500).json({ message: "팀 일정 추가 중 오류 발생" });
    }
};

//팀 일정 삭제 API (DELETE /user/:userId/userSchdule/:userScheduleId)
export const deleteTeamSchedule = async (req, res) => {
    try {
        const { clubId, teamId, teamScheduleId } = req.params;

        //사용자 일정 존재 확인
        const existingSchedule = await prisma.teamSchedule.findUnique({
            where: { team_schedule_id: Number(teamScheduleId) }
        });
    
        if (!existingSchedule) {
            logger.info('팀 일정이 존재하지 않음', {teamScheduleId});
            return res.status(404).json({ message: "해당 사용자 일정을 찾을 수 없습니다." });
        }

        //사용자 일정 삭제
        await prisma.teamSchedule.delete({
            where: { team_schedule_id: Number(teamScheduleId) }
        });

        logger.info('팀 일정이 삭제 됐습니다.', { teamScheduleId });
        return res.status(200).json({ message: "팀 일정이 삭제되었습니다." });
    } catch (error) {
        logger.error('사용자 일정 삭제 중 오류 발생:', error);
        return res.status(500).json({ message: "팀 일정 삭제 중 오류 발생" });
    }
};

//사용자 일정 수정 API (PATCH /user/:userId/userSchedule/:userScheduld)
export const modifyTeamSchedule = async (req, res) => {
    try {
        const { clubId, teamId, teamScheduleId } = req.params;
        const { teamScheduleTime, teamScheduleTitle, teamSchedulePlace, participatedMembers } = req.body;
        const teamMemberArray = participatedMembers ? participatedMembers.split(",") : [];

        if (teamScheduleTime) {
            const startTime = new Date(teamScheduleTime);
            startTime.setMilliseconds(0);
            startTime.setSeconds(0);

            // 30분 단위로 끝나는 시간을 설정
            const endTime = new Date(startTime);
            endTime.setMinutes(Math.ceil(startTime.getMinutes() / 30) * 30 + 30);  // 30분 단위로 올림
            endTime.setSeconds(0)

            const conflictSchedule = await prisma.teamSchedule.findFirst({
                where: {
                    team_id: Number(teamId),
                    team_schedule_time: {
                        gte: startTime,
                        lte: endTime
                    }
                }
            });

        //존재하는 일정인지 확인
            if (conflictSchedule) {
                logger.info('이미 일정이 존재하는 시간대입니다.')
                return res.status(400).json({ message: "이 시간대에는 이미 일정이 존재합니다." });
            }   
        }

        const existingSchedule = await prisma.teamSchedule.findUnique({
                    where: { team_schedule_id: Number(teamScheduleId) }
                });
        
        if (!existingSchedule) {
            logger.info('팀 일정이 존재하지 않음', {teamScheduleId});
            return res.status(404).json({ message: "해당 팀 일정을 찾을 수 없습니다." });
        }

        //사용자 일정 데이터베이스에 추가
        const updateTeamSchedule = await prisma.teamSchedule.update({
            where: { team_schedule_id: Number(teamScheduleId) },
            data: {
                team_schedule_time: teamScheduleTime ? new Date(teamScheduleTime) :existingSchedule.team_schedule_time,
                team_schedule_title: teamScheduleTitle ?? existingSchedule.team_schedule_title,
                team_schedule_place: teamSchedulePlace ?? existingSchedule.team_schedule_place,
                team_schedule_participated: teamMemberArray ?? existingSchedule.team_schedule_participated
            }
        });

        logger.info('팀 일정이 수정 됐습니다.')
        return res.status(201).json(updateTeamSchedule);
    } catch (error) {
        logger.error('팀 일정 수정 중 오류 발생:', error);
        return res.status(500).json({ message: "팀 일정 수정 중 오류 발생" });
    }
};