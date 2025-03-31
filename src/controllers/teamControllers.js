import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();

export const getTeam = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { type } = req.query;

        if (type == "my") {
            const userId = req.user.user_id;

            const myTeams = await prisma.teamMember.findMany({
                where: {
                    user_id: Number(userId),
                    team: {
                        club_id: Number(clubId)
                    }
                },
                select: {
                    team: {
                        select: {
                            team_id: true,
                            team_img: true,
                            team_name: true,
                        }
                    }
                }
            });
            logger.debug("내 팀 목록 조회 성공", { clubId, myTeams });
            return res.status(200).json(myTeams);
        } 
        
        else {
            const teams = await prisma.team.findMany({
                where: {
                    club_id: Number(clubId)
                },
                select: {
                    team_id: true,
                    team_img: true,
                    team_name: true,
                }
            });
    
            logger.debug("팀 목록 조회 성공", { clubId, teams });
            return res.status(200).json(teams);
        }
    } catch (error) {
        logger.error(`팀 목록 조회 검증 실패: ${error.message}`, { error });
        return res.status(500).json({ message: "팀 목록 조회 중 오류가 발생했습니다." });
    }
};

export const viewTeam = async (req, res) => {
    try {
        const { clubId, teamId } = req.params;

        const teamInfo = {
            teamId: req.team.team_id,
            creator: req.team.creator,
            teamName: req.team.team_name
        }

        const teamMember = await prisma.teamMember.findUnique({
            where: {
                team_id: Number(teamId)
            }, select: {
                user_id: true,
                user: {
                    select: {
                        user_id: true,
                        user_name: true,
                        profile_image: true
                    }
                }
            }
        });

        logger.debug("팀 조회 성공", { teamId, teamInfo, teamMember });
        return res.status(200).json({
            teamInfo,
            teamMember
        });  
    
    } catch (error) {
    logger.error(`팀 조회 검증 실패: ${error.message}`, { error });
    return res.status(500).json({ message: "서버 오류 발생" });
    }
};

export const viewMemberList = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { lastId } = req.query; // 쿼리 파라미터에서 lastId와 limit 가져오기

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

        logger.debug(`동아리 회원 목록 조회 성공, ${ clubId }`);
        return res.status(200).json(members);
    } catch (error) {
        logger.error(`동아리 회원 목록 조회 중 오류 발생: ${error.message}`);
        return res.status(500).json({ message: "동아리 회원 목록 조회 중 오류가 발생했습니다." });
    }
};

export const createTeam = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { teamName, members } = req.body;
        let profileImageUrl;
        
        if (!teamName) {
            return res.status(400).json({ message: "팀 이름을 입력해주세요." });
        }

        if (!members || members.length === 0) {
            return res.status(400).json({ message: "팀원을 추가해주세요." });
        }

        // 파일이 없으면 기본 이미지를 사용
        if (!req.file) {
            // 기본 이미지 URL (AWS S3에 저장된 기본 이미지를 사용할 수 있도록 따로 설정예정)
            profileImageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/profile/default/default-image.jpg`;
        } else {
            // 파일이 있으면 AWS S3에 업로드
            const bucketName = process.env.AWS_S3_BUCKET_NAME;
            const key = `profile/custom/${req.user.userID}/${req.user.userID}-${Date.now()}`;

            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: req.file.buffer, // Multer는 파일 데이터를 buffer로 제공
                ContentType: req.file.mimetype, // 파일의 MIME 타입
            });

            await s3Client.send(command);

            // 업로드된 파일의 URL 생성
            profileImageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        }

        const createdTeam = await prisma.team.create({
            data: {
                team_name: teamName,
                team_img: profileImageUrl,
                club_id: Number(clubId),
                team_leader: req.user.user_id,
            }
        });

        await prisma.teamMember.createMany({
            data: members.map(member => ({
                team_id: createdTeam.team_id,
                user_id: member.user_id,
            })),
        });

        logger.debug("팀 생성 성공", { clubId, teamName, members });
        return res.status(201).json({ message: "팀이 성공적으로 생성되었습니다." });
    } catch (error) {
        logger.error("팀 생성 실패: ", error);
        return res.status(500).json({ message: "팀 생성 중 서버 오류가 발생했습니다." });
    }
};

export const changeTeamProfile = async (req, res) => {
    try {
        let profileImageUrl;

        // 파일이 없으면 기본 이미지를 사용
        if (!req.file) {
            // 기본 이미지 URL (AWS S3에 저장된 기본 이미지를 사용할 수 있도록 따로 설정예정)
            profileImageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/profile/default/default-image.jpg`;
        } else {
            // 파일이 있으면 AWS S3에 업로드
            const bucketName = process.env.AWS_S3_BUCKET_NAME;
            const key = `profile/custom/${req.user.userID}/${req.user.userID}-${Date.now()}`;

            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: req.file.buffer, // Multer는 파일 데이터를 buffer로 제공
                ContentType: req.file.mimetype, // 파일의 MIME 타입
            });

            await s3Client.send(command);

            // 업로드된 파일의 URL 생성
            profileImageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        }

        // 팀의 프로필 이미지 URL 업데이트
        const updatedTeam = await prisma.team.update({
            where: { team_id: req.team.user_id },
            data: { profile_img: profileImageUrl },
        });

        // 성공 응답
        res.status(200).json({ message: '팀 이미지가 성공적으로 업데이트되었습니다.' });
    } catch (error) {
        logger.error("팀 이미지 변경 실패: ", error);
        return res.status(500).json({ message: "팀 이미지를 변경 중 서버 오류 발생" });
    }
};

export const changeTeamName = async (req, res) => {
    try {
        const { clubId, teamId } = req.params;
        const { teamName } = req.body;

        if(!teamName) {
            return res.status(400).json({ message: "팀 이름을 입력해주세요." });
        }

        await prisma.team.update({
            where: {
                team_id: Number(teamId),
            },
            data: {
                team_name: teamName,
            },
        });

        logger.debug("팀 이름 변경 성공", { clubId, teamId, teamName });
        return res.status(200).json({ message: "팀 이름이 성공적으로 변경되었습니다." });
    } catch (error) {
        logger.error(`팀 이름 변경 검증 실패: ${error.message}`, { error });
        return res.status(500).json({ message: "팀 이름 변경 중 오류 발생" });
    }
};

export const addTeamMembers = async (req, res) => {
    try {
        const { clubId, teamId } = req.params;
        const { members } = req.body; // 추가할 팀원 ID 배열
        
        if (!members || members.length === 0) {
            return res.status(400).json({ message: "추가할 팀원을 입력해주세요." });
        }

        // 팀원 추가
        await prisma.teamMember.createMany({
            data: members.map(member => ({
                team_id: Number(teamId),
                user_id: member.userId,
            })),
        });

        logger.debug("팀원 추가 성공", { clubId, teamId, members });
        return res.status(200).json({ message: "팀원이 성공적으로 추가되었습니다." });
    } catch (error) {
        logger.error(`팀원 추가 검증 실패: ${error.message}`, { error });
        return res.status(500).json({ message: "팀원 추가 중 오류 발생" });
    }
};

export const deleteTeam = async (req, res) => {
    try {
        const { clubId, teamId } = req.params;
        
        // 팀 삭제
        await prisma.team.delete({
            where: {
                team_id: Number(teamId),
            },
        });

        logger.debug("팀 삭제 성공", { clubId, teamId, userId });
        return res.status(200).json({ message: "팀이 성공적으로 삭제되었습니다." });
    } catch (error) {
        logger.error(`팀 삭제 검증 실패: ${error.message}`, { error });
        return res.status(500).json({ message: "팀 삭제 중 오류 발생" });
    }
};

export const kickTeamMember = async (req, res) => {
    try {
        const { clubId, teamId } = req.params;
        const { userId } = req.body; // 삭제할 사용자 ID
        
        // 팀원 삭제
        await prisma.teamMember.delete({
            where: {
                team_id_user_id: {
                    team_id: Number(teamId),
                    user_id: Number(userId),
                },
            },
        });

        logger.debug("팀원 삭제 성공", { clubId, teamId, userId });
        return res.status(200).json({ message: "팀원이 성공적으로 삭제되었습니다." });
    } catch (error) {
        logger.error(`팀원 삭제 검증 실패: ${error.message}`, { error });
        return res.status(500).json({ message: "팀원 삭제 중 오류 발생" });
    }
};

export const leaveTeam = async (req, res) => {
    try {
        const { clubId, teamId } = req.params;
        const userId = req.user.user_id; 
        
        // 팀원 삭제
        await prisma.teamMember.delete({
            where: {
                team_id_user_id: {
                    team_id: Number(teamId),
                    user_id: Number(userId),
                },
            },
        });

        logger.debug("팀원 삭제 성공", { clubId, teamId, userId });
        return res.status(200).json({ message: "팀에서 성공적으로 탈퇴되었습니다." });
    } catch (error) {
        logger.error(`팀원 삭제 검증 실패: ${error.message}`, { error });
        return res.status(500).json({ message: "팀 탈퇴 중 오류 발생" });
    }
};

export const changeTeamLeader = async (req, res) => {
    try {
        const { clubId, teamId } = req.params;
        const { newLeader } = req.body; // 새로운 팀장 ID
        
        // 팀장 변경
        await prisma.team.update({
            where: {
                team_id: Number(newLeader),
            },
            data: {
                creator: Number(userId),
            },
        });

        logger.debug("팀장 변경 성공", { clubId, teamId, userId });
        return res.status(200).json({ message: "팀장이 성공적으로 변경되었습니다." });
    } catch (error) {
        logger.error(`팀장 변경 검증 실패: ${error.message}`, { error });
        return res.status(500).json({ message: "팀장 변경 중 오류 발생" });
    }
};