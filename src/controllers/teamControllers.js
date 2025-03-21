import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();

// 팀 생성
export const createTeam = async (req, res) => {
    try {
        const clubId = req.params.clubId;
        const userId = req.user.user_id;
        const { teamName }  = req.body;

        if(!teamName) {
            logger.error("팀 이름이 제공되지 않았습니다.");
            return res.status(400).json({ message: "팀 이름이 필요합니다." });
        }

        if(!clubId) {
            logger.error("동아리 ID가 제공되지 않았습니다.");
            return res.status(400).json({ message: "동아리 ID가 필요합니다." });
        }

        // 팀 생성
        const newTeam = await prisma.Team.create({
            data: {
                team_name: String(teamName),
                club_id: Number(clubId),
                created_by: userId,
                created_at: new Date(),
            },
        });

        await prisma.TeamMember.create({
            data: {
                team_id: newTeam.team_id,
                user_id: userId,
            },
        });

        logger.info("팀 생성 완료", { teamId: newTeam.team_id });
        return res.status(201).json(newTeam);
    } catch (error) {
        logger.error("팀 생성 실패" + error.message);
        return res.status(500).json({ message: "서버 오류 발생" });
    }
}

export const deleteTeam = async (req, res) => {
    try {
      const teamId  = req.params.teamId; // URL에서 teamId 가져옴
  
      // 팀이 존재하는지 확인
      const team = await prisma.Team.findUnique({
        where: { team_id: Number(teamId) },
      });
  
      if (!team) {
        return res.status(404).json({ message: "팀이 존재하지 않습니다." });
      }
  
      // 팀 삭제
      await prisma.Team.delete({
        where: { team_id: Number(teamId) },
      });
  
      logger.info(`팀 ${teamId} 삭제 완료`);
      return res.status(200).json({ message: "팀이 삭제되었습니다." });
    } catch (error) {
      logger.error(`팀 삭제 실패: ${error.message}`);
      return res.status(500).json({ message: "서버 오류 발생" });
    }
  };

//팀원 추가
export const addTeamMembers = async (req, res) => {
    try {
        const { teamId } = req.params; // URL에서 teamId 가져옴
        const { userIds } = req.body; // 요청 본문에서 userId 리스트 가져옴

        if (!teamId) {
            return res.status(400).json({ message: "팀 ID가 필요합니다." });
        }

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: "추가할 사용자 ID 리스트가 필요합니다." });
        }

        // 기존 팀 멤버 조회
        const existingMembers = await prisma.TeamMember.findMany({
            where: { team_id: Number(teamId) },
            select: { user_id: true },
        });

        const existingUserIds = new Set(existingMembers.map((member) => member.user_id));

        // 중복되지 않는 사용자만 추가
        const newMembers = userIds
            .map((userId) => Number(userId)) // userId를 숫자로 변환
            .filter((userId) => !existingUserIds.has(userId)) // 기존 멤버가 아닌 사용자만 추가
            .map((userId) => ({
                team_id: Number(teamId),
                user_id: userId,
            }));

        if (newMembers.length > 0) {
            await prisma.TeamMember.createMany({
                data: newMembers,
                skipDuplicates: true, // 중복 삽입 방지
            });
            logger.info(`팀 ${teamId}에 새로운 멤버 추가: ${newMembers.map(m => m.user_id).join(", ")}`);
        } else {
            logger.warn(`모든 사용자가 이미 팀 ${teamId}에 속해 있습니다.`);
        }

        return res.status(201).json({ message: "팀 멤버 추가 완료", addedMembers: newMembers.length });
    } catch (error) {
        logger.error(`팀 멤버 추가 실패: ${error.message}`);
        return res.status(500).json({ message: "서버 오류 발생" });
    }
};

// 팀원 방출


