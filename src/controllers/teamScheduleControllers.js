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

        //여기 2진 인코딩해서 보내야함 
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

//스택에 소괄호로 표현한 string을 보낼지, ascii문자열로 보낼지 결정해야함
/*
export const adjustSchedule = async (req, res) => {
    try{
       const { clubId, teamId } = req.params;
       const { day } = req.query;

       const userIds = await prisma.teamMember.findMany({
              where: {
                team_id: Number(teamId),
              },
              select: {
                user_id: true,
              },
        });

        const userIdsArray = userIds.map(user => user.user_id);

        // 주의 시작(월요일 00:00:00)과 끝(일요일 23:59:59) 계산
        const startDate = new Date(day);
        startDate.setDate(inputDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        // 7일(월~일) * 32칸(30분 단위) 초기화
        let availabilityMatrix = Array.from({ length: 7 }, () => Array(32).fill(0));

        const userSchedules = await prisma.userSchedule.findMany({
            where: {
                user_id: { in: userIdsArray },
                user_schedule_start: { gte: startDate, lte: endDate }
            },
            select: {
                user_id: true,
                user_schedule_start: true,
                user_schedule_end: true,
            },
            orderBy: { 
                user_schedule_start: "asc" 
            }
        });

        //타임라인 스위핑
        for (const schedule of userSchedules) {
            const dayIndex = Math.floor((schedule.user_schedule_start - startDate) / (1000 * 60 * 60 * 24)); // 0~6 (월~일)
            const startSlot = Math.floor(schedule.user_schedule_start.getHours() * 2 + schedule.user_schedule_start.getMinutes() / 30);
            const endSlot = Math.floor(schedule.user_schedule_end.getHours() * 2 + schedule.user_schedule_end.getMinutes() / 30);

            for (let i = startSlot; i < endSlot; i++) {
                availabilityMatrix[dayIndex][i]++;  // 해당 시간대에 +1
            }
        }

        function encodeRLE(arr) {
            let result = [];
            let prev = arr[0], count = 1;
            for (let i = 1; i < arr.length; i++) {
                if (arr[i] === prev && count < 15) count++;
                else {
                    result.push((prev << 4) | count);
                    prev = arr[i];
                    count = 1;
                }
            }
            result.push((prev << 4) | count);
            return result;
        }

        function convertToAscii(byteArray) {
            return byteArray.map(byte => String.fromCharCode(byte)).join("");
        }
    
        function rleToStackString(rleData) {
            return rleData
                .map(byte => {
                    let value = byte >> 4;
                    let count = byte & 0x0F;
                    if (value === 0) return ".".repeat(count);
                    return "(".repeat(value) + " ".repeat(count) + ")".repeat(value);
                })
                .join("");
        }
    
        let compressedData = [];
        let encodedStrings = [];
    
        for (let i = 0; i < 7; i++) {
            let rleEncoded = encodeRLE(availabilityMatrix[i]);
            compressedData.push(rleEncoded);
            encodedStrings.push(rleToStackString(rleEncoded));
        }
    
        return { weekStart: startDate, availability: encodedStrings };

    } catch (error) {
        logger.error('팀 일정 조정 중 오류 발생:', error);
        return res.status(500).json({ message: "팀 일정 조정 중 오류 발생" });
    }
};
*/