import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();

export const verifyTeam = async (req, res, next) => {
  try {
      const { clubId, teamId } = req.params;
      
      const team  = await prisma.team.findFirst({
        where: { 
          club_id: Number(clubId),
          team_id: Number(teamId),
         },
      });

      if (!team) {
        logger.debug(`존재하지 않는 팀 입니다 ${teamId}`)
        return res.status(404).json({ message: "존재하지 않는 팀입니다." });
    }

    req.team = team;

    logger.debug("팀 존재 여부 검증 완료");
    next();
  } catch(error) {
    logger.error(`팀 여부 검증 실패${error.message}`, { error } );
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};

export const isTeamLeader = async (req, res, next) => {
    try {
        const { clubId, teamId } = req.params;
        const userId = req.user.user_id;
		const teamLeader = req.team.team_leader;

        if (teamLeader !== userId) {
        logger.debug("해당팀의 팀장이 아닙니다", { clubId },{ teamId }, { userId });
        return res.status(401).json({ message: "해당 기능에 접근할 권한이 없습니다." });
      	}
      
        logger.debug("팀장 검증 완료", { clubId }, { userId });
    	next();
  } catch (error) {
      logger.error(`회장 검증 과정 중 실패: ${error.message}`, { error });
      return res.status(500).json({ message: "서버 오류 발생" });
  }
};

export const isMyTeam = async (req, res, next) => {
    try {
        const { clubId, teamId } = req.params;
        const userId = req.user.user_id;
        
        //clubMember 테이블에서 동아리 가입여부 검증
        const teamMember = await prisma.teamMember.findFirst({
            where: {
                team_id: Number(teamId),
                user_id: Number(userId),
            },
        });

        if (!teamMember) {
            logger.debug("팀에 가입하지 않은 사용자 입니다.");
            return res.status(409).json({ message: "동아리에 가입되지 않은 사용자입니다."})
        }

        req.teamMember = teamMember;

        logger.debug("팀 가입 여부 검증 완료");
        next();
    } catch(error) {
        logger.error(`동아리 가입 여부 검증 실패${error.message}`, { error } );
        return res.status(500).json({ message: "서버 오류 발생" });
    }
};

export const isUserJoinedTeam = async (req, res, next) => {
	try {
		const { clubId, teamId } = req.params;
		const { userId } = req.body;
		
		//clubMember 테이블에서 동아리 가입여부 검증
		const teamMember = await prisma.teamMember.findFirst({
			where: {
				team_id: Number(teamId),
				user_id: Number(userId),
			},
		});

		if (!teamMember) {
			logger.debug("팀에 가입하지 않은 사용자 입니다.");
			return res.status(409).json({ message: "동아리에 가입되지 않은 사용자입니다."})
		}

		logger.debug("가입 여부 검증 완료");
		next();
	} catch(error) {
		logger.error(`팀 가입 여부 검증 실패${error.message}`, { error } );
		return res.status(500).json({ message: "서버 오류 발생" });
	}
};
