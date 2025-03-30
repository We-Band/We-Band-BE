import { logger } from "../utils/logger.js";  
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

// 동아리 가입 API (POST /clubs)
export const joinClub = async (req, res) => {
    try {
        const { clubCode } = req.body;
        const userId = req.user.user_id;

        //clubCode누락 여부 검증
        if (!clubCode) {
            logger.error("동아리 가입 코드가 제공되지 않았습니다.");
            return res.status(400).json({ message: "동아리 가입 코드가 필요합니다." });
        }

        const club = await prisma.club.findUnique({
            where: { club_code: clubCode },
            select: {
                club_id: true
            },
        });

        if (!club) {
            logger.debug(`잘못된 동아리 코드 입력: clubCode ${clubCode}`);
            return res.status(404).json({ message: "잘못된 동아리 코드입력" });
        }

        const clubId = club.club_id; // club_id를 가져옴

        //가입여부 검증
        const existingMember = await prisma.clubMember.findFirst({
            where: {
                club_id: clubId,
                user_id: userId,
            },
        });

        if (existingMember) {
            logger.debug(`이미 가입된 동아리, ${ clubId }, ${ userId }`);
            return res.status(409).json({ message: "이미 가입된 동아리입니다." });
        }

        // clubMember 테이블에 user 추가
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

        logger.info(`사용자 ${userId}가 동아리 ${clubId}에 가입함`);
        return res.status(200).json({ message: "동아리에 성공적으로 가입했습니다." });

    } catch (error) {
        logger.error(`동아리 가입 중 오류 발생: ${error.message}`);
        return res.status(500).json({ message: "동아리 가입 중 오류가 발생했습니다." });
    }
};

export const viewClub = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { lastId } = req.query; // 쿼리 파라미터에서 lastId와 limit 가져오기
        const club = req.club;
        
        const { club_name, 
                club_code, 
                club_img,
                member_count, 
                club_leader } = club;

        const clubCreatedAt = club.created_at.toISOString().split("T")[0]; // YYYY-MM-DD 형식으로 변환

        //scrolling으로 가져올때 lastId가 있으면 lastId 이후 데이터부터 가져옴
        //lastId가 없으면 처음부터 가져옴, 두번쨰 요청부터 lastId가 생김
        const clubMembers = await prisma.clubMember.findMany({
            where: {
                club_id: Number(clubId),
            },
            take: Number(10),  // 한 번에 가져올 수
            skip: lastId ? 1 : 0,  // lastId가 있으면 한 개는 건너뛰기
            cursor: lastId ? { user_id: Number(lastId) } : undefined,  // lastId가 있으면 그 이후 데이터부터 불러오기
            orderBy: {
                created_at: 'asc',  // 회원을 ID 순서대로 정렬
            },
            select: {
                user_id: true,
                user: {
                    select: {
                        user_name: true,
                        profile_image: true,
                    },
                },
            },
        });

        const members = clubMembers.map((member) => ({
            userId: member.user_id,
            userName: member.user.user_name,
            profileImage: member.user.profile_image,
        }));

        const clubInfo = {
            clubId: clubId,
            clubName: club_name,
            clubImg: club_img,
            clubCode: club_code,
            memberCount: member_count,
            leaderId: club_leader,
            createdAt: clubCreatedAt,
        };

        logger.debug(`동아리 정보 조회 성공, ${ clubId }, ${ clubInfo }`);
        return res.status(200).json(clubInfo, members);
    } catch (error) {
        logger.error(`동아리 조회 중 오류 발생: ${error.message}`);
        return res.status(500).json({ message: "동아리 조회 중 오류가 발생했습니다." });
    }
};


//동아리 탈퇴 API (DELETE /clubs/:clubId)
export const quitClub = async (req, res) => {
    try {
        const { clubId } = req.params;
        const userId = req.user.user_id;

        //clubMember 테이블에 사용자 삭제
        await prisma.clubMember.delete({
            where: {
                club_id_user_id: {   // 두 필드를 합친 복합키로 삭제
                    club_id: Number(clubId),
                    user_id: Number(userId),
                },
            },
        });

        //가입 인원 수 감소
        await prisma.club.update({
            where: { club_id: Number(clubId) },
            data: {
                member_count: { decrement: 1 }, // 인원 -1 
            },
        });

        logger.info(`사용자 ${userId}가 동아리 ${clubId}에 탈퇴 했습니다.`);
        return res.status(200).json({ message: "동아리 탈퇴를 성공했습니다." });
    } catch(error) {
        logger.error(`동아리 탈퇴 중 오류 발생: ${error.message}`);
        return res.status(500).json({ message: "동아리 탈퇴 중 오류가 발생했습니다." });
    }
};

//동아리 추방API (DELETE /clubs/:clubId/kick)
export const kickMember = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { userId } = req.body;
        const myId = req.user.user_id;

        //추방할 user랑 회장 아이디랑 같으면 추방 불가능
        if (userId == myId) {
            logger.debug('회장은 퇴출할 수 없습니다');
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

        logger.info(`사용자 ${userId}를 동아리 ${clubId}에서 내보냈습니다.`);
        return res.status(200).json({ message: "회원 강퇴를 성공했습니다."});
    } catch(error) {
        logger.error(`동아리 퇴출 중 오류 발생: ${error.message}`);
        return res.status(500).json({ message: "동아리 추방 중 오류가 발생했습니다." });
    }
};

//동아리 가입 코드 수정 API (PATCH /clubs/:clubId/setting)
export const changeCode = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { newCode } = req.body;

        //가입 코드 누락 여부 검증
        if (!newCode) {
            console.error("동아리 가입 코드가 제공되지 않았습니다.");
            return res.status(400).json({ message: "동아리 가입 코드가 필요합니다." });
        }
        
        //가입 코드 변경
        await prisma.club.update({
            where: { club_id: Number(clubId) },
            data: {
                club_code: newCode,
            },
        });

        logger.info(`동아리 ${clubId}에 가입 코드가 변경 되었습니다.`);
        return res.status(200).json({ message: "동아리 가입 코드가 수정 되었습니다."});
    } catch (error) {
        logger.error(`동아리 코드 변경 중 오류 발생: ${error.message}`);
        return res.status(500).json({ message: "동아리 코드 변경 중 오류가 발생했습니다." });
    }
};

//동아리 회장 변경 API (PATCH /clubs/:clubId/leader)
export const changeLeader = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { newLeader } = req.body;

        //변경할 회장 아이디 누락 여부 검증
        if (!newLeader) {
            logger.debug("새로 임명할 회장 누락");
            return res.status(400).json({ messsage: "회장으로 임명할 사용자 정보가 누락 되었습니다."});
        }
        
        //동아리 회장 변경
        await prisma.club.update({
            where: { club_id: Number(clubId) },
            data: {
                club_leader: Number(newLeader),
            },
        });

        logger.info(`동아리 ${clubId}에 회장이 사용자: ${newLeader}로 변경되었습니다.`);
        return res.status(200).json({ message: "동아리 회장이 변경 되었습니다." });
    } catch (error) {
        logger.error(`동아리 회장 변경 중 오류 발생: ${error.message}`);
        return res.status(500).json({ message: "동아리 회장 변경 중 오류가 발생했습니다." });
    }
};