import { ClubService } from "../services/clubService.js";
import {
  JoinClubDTO,
  ChangeCodeDTO,
  ChangeLeaderDTO,
} from "../dtos/club.dto.js";
import { logger } from "../utils/logger.js";

export const joinClub = async (req, res) => {
  try {
    const dto = new JoinClubDTO({
      clubCode: req.body.clubCode,
      userId: req.user.user_id,
    });
    const result = await ClubService.joinClub(dto);
    return res.status(200).json(result);
  } catch (err) {
    logger.error(err.message);
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const quitClub = async (req, res) => {
  try {
    const result = await ClubService.quitClub({
      clubId: Number(req.params.clubId),
      userId: req.user.user_id,
    });
    return res.status(200).json(result);
  } catch (err) {
    logger.error(err.message);
    return res.status(500).json({ message: err.message });
  }
};

export const kickMember = async (req, res) => {
  try {
    const result = await ClubService.kickMember({
      clubId: Number(req.params.clubId),
      userId: req.body.userId,
      myId: req.user.user_id,
    });
    return res.status(200).json(result);
  } catch (err) {
    logger.error(err.message);
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const changeCode = async (req, res) => {
  try {
    const dto = new ChangeCodeDTO({ newCode: req.body.newCode });
    const result = await ClubService.changeCode({
      clubId: Number(req.params.clubId),
      ...dto,
    });
    return res.status(200).json(result);
  } catch (err) {
    logger.error(err.message);
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const changeLeader = async (req, res) => {
  try {
    const dto = new ChangeLeaderDTO({ newLeader: req.body.newLeader });
    const result = await ClubService.changeLeader({
      clubId: Number(req.params.clubId),
      ...dto,
    });
    return res.status(200).json(result);
  } catch (err) {
    logger.error(err.message);
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const viewClub = async (req, res) => {
  try {
    const { clubInfo, members } = await ClubService.getClubMembers({
      clubId: Number(req.params.clubId),
      club: req.club,
    });
    return res.status(200).json({ clubInfo, members });
  } catch (err) {
    logger.error(err.message);
    return res.status(500).json({ message: "동아리 정보 조회 실패" });
  }
};
