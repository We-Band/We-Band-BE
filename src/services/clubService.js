import { ClubRepository } from "../repositories/clubRepository.js";
import { logger } from "../utils/logger.js";

export const ClubService = {
  joinClub: async ({ clubCode, userId }) => {
    const club = await ClubRepository.findByCode(clubCode);
    if (!club) throw { status: 404, message: "잘못된 동아리 코드입력" };

    const clubId = club.club_id;
    const isAlreadyMember = await ClubRepository.isMember(clubId, userId);
    if (isAlreadyMember) {
      throw { status: 409, message: "이미 가입된 동아리입니다." };
    }

    await ClubRepository.addMember(clubId, userId);
    await ClubRepository.incrementMemberCount(clubId);

    logger.info(`사용자 ${userId}가 동아리 ${clubId}에 가입함`);
  },

  quitClub: async ({ clubId, userId }) => {
    await ClubRepository.removeMember(clubId, userId);
    await ClubRepository.decrementMemberCount(clubId);
    logger.info(`사용자 ${userId}가 동아리 ${clubId}에서 탈퇴함`);
  },

  kickMember: async ({ clubId, userId, myId }) => {
    if (userId === myId)
      throw { status: 405, message: "회장은 퇴출 불가능합니다." };

    await ClubRepository.removeMember(clubId, userId);
    logger.info(`사용자 ${userId}를 동아리 ${clubId}에서 추방함`);
  },

  changeCode: async ({ clubId, newCode }) => {
    await ClubRepository.updateCode(clubId, newCode);
    logger.info(`동아리 ${clubId}의 가입 코드 변경됨`);
  },

  changeLeader: async ({ clubId, newLeader }) => {
    await ClubRepository.updateLeader(clubId, newLeader);
    logger.info(`동아리 ${clubId}의 회장이 ${newLeader}로 변경됨`);
  },

  getClubMembers: async ({ clubId, club }) => {
    const membersRaw = await ClubRepository.getMembers(clubId);
    logger.debug(`동아리 회원 조회 성공 ${clubId}`);

    const members = membersRaw.map((m) => ({
      userId: m.user.user_id,
      userName: m.user.user_name,
      profileImage: m.user.profile_image,
    }));

    const clubInfo = {
      clubId,
      clubName: club.club_name,
      clubImg: club.club_img,
      clubCode: club.club_code,
      memberCount: club.member_count,
      leaderId: club.club_leader,
      createdAt: club.created_at.toISOString().split("T")[0],
    };

    logger.debug("clubinfo, members객체 생성 성공");
    return { clubInfo, members };
  },
};
