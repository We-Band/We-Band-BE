import { ClubService } from "../services/clubService.js";
import { logger } from "../utils/logger.js";

// 동아리 가입 API (POST /clubs)
export const joinClub = async (req, res) => {
  try {
    const { clubCode } = req.body;
    const userId = req.user.user_id;

    await ClubService.joinClub({ clubCode, userId });
    logger.debug("동아리 가입 성공");
    return res
      .status(200)
      .json({ message: "동아리에 성공적으로 가입했습니다." });
  } catch (error) {
    logger.error(`동아리 가입 실패: ${error.message}`, { error });
    return res
      .status(500)
      .json({ message: `동아리 가입 실패: ${error.message}` });
  }
};

export const quitClub = async (req, res) => {
  try {
    let { clubId } = req.params;
    clubId = Number(clubId);
    const userId = req.user.user_id;
    await ClubService.quitClub({ clubId, userId });

    logger.debug("동아리 탈퇴를 성공했습니다.");
    return res.status(200).json({ message: "동아리 탈퇴를 성공했습니다." });
  } catch (error) {
    logger.error(`동아리 탈퇴 실패: ${error.message}`, { error });
    return res
      .status(500)
      .json({ message: `동아리 탈퇴 실패: ${error.message}` });
  }
};

export const kickMember = async (req, res) => {
  try {
    let { clubId } = req.params;
    clubId = Number(clubId);
    const { kickUser } = req.body;
    const myId = req.user.user_id;

    await ClubService.kickMember({ clubId, kickUser, myId });
    return res.status(200).json({ message: "회원 강퇴를 성공했습니다." });
  } catch (error) {
    logger.error(`동아리 추방 실패: ${error.message}`, { error });
    return res
      .status(500)
      .json({ message: `동아리 추방 실패: ${error.message}` });
  }
};

export const changeCode = async (req, res) => {
  try {
    const { newCode } = req.body;
    const { clubId } = req.params;

    await ClubService.changeCode(clubId, newCode);
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`동아리 가입 코드 변경 중 오류 발생 ${error.message}`, {
      error,
    });
    return res
      .status(500)
      .json({ message: `동아리 가입 코드 변경 중 오류 발생 ${error.message}` });
  }
};

export const changeLeader = async (req, res) => {
  try {
    const { newLeader } = req.body;
    const { clubId } = req.params;

    await ClubService.changeLeader(clubId, newLeader);

    logger.info("동아리 코드가 변경되었습니다.");
    return res.status(200).json({ message: "동아리 회장이 변경 되었습니다." });
  } catch (error) {
    logger.error(`동아리 회장 변경 중 오류 발생: ${error.message}`, { error });
    return res
      .status(500)
      .json({ message: `동아리 회장 변경 중 오류 발생: ${error.message}` });
  }
};

export const viewClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const club = req.club;

    const { clubInfo, members } = await ClubService.getClubMembers({
      clubId,
      club,
    });

    logger.debug("동아리 정보 조회 성공");
    return res.status(200).json({ clubInfo, members });
  } catch (error) {
    logger.error(`동아리 목록 조회 검증 실패: ${error.message}`, { error });
    return res
      .status(500)
      .json({ message: `동아리 목록 조회 검증 실패: ${error.message}` });
  }
};

export const getMyClubs = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const clubs = await ClubService.getMyClubs(userId);
    return res.status(200).json(clubs);
  } catch (error) {
    logger.error(`내 동아리 조회 중 오류 발생: ${error.message}`, { error });
    return res
      .status(500)
      .json({ message: `내 동아리 조회 중 오류 발생: ${error.message}` });
  }
};
