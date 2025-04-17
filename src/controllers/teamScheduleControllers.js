import { teamScheduleService } from "../services/teamScheduleService.js";
import { logger } from "../utils/logger.js";
import { teamScheduleDto } from "../dtos/teamScheduleDto.js";

export const viewTeamSchedule = async (req, res) => {
  try {
    const { clubId, teamId } = req.params;
    const { day } = req.query;

    const result = await teamScheduleService.getTeamWeeklySchedule(teamId, day);
    logger.debug("팀 주간 일정을 보냈습니다.");
    res.json(result);
  } catch (error) {
    logger.error(`팀 일정 정보 조회 중 오류 발생: ${error.message}`, error);
    res.status(500).json({ message: "팀 정보 조회 중 오류가 발생했습니다." });
  }
};

export const viewDetailTeamSchedule = async (req, res) => {
  try {
    const teamSchedule = req.teamSchedule;

    logger.debug(`팀 일정 정보를 보냈습니다., `);
    res.json(teamSchedule);
  } catch (error) {
    logger.error(`팀 일정 정보 조회 중 오류 발생: ${error.message}`, error);
    res
      .status(500)
      .json({ message: "팀 일정 정보 조회 중 오류가 발생했습니다." });
  }
};

export const addTeamSchedule = async (req, res) => {
  try {
    const { clubId, teamId } = req.params;
    const dto = new teamScheduleDto(req.body);

    const result = await teamScheduleService.addTeamSchedule(teamId, dto);
    logger.debug("팀 일정이 추가 됐습니다.");
    res.status(201).json(result);
  } catch (error) {
    logger.error("팀 일정 추가 중 오류 발생:", error);
    res.status(500).json({ message: "팀 일정 추가 중 오류 발생" });
  }
};

export const deleteTeamSchedule = async (req, res) => {
  try {
    const { teamScheduleId } = req.params;

    await teamScheduleService.deleteTeamSchedule(teamScheduleId);
    logger.debug("팀 일정이 삭제 됐습니다.");
    res.status(200).json({ message: "팀 일정이 삭제되었습니다." });
  } catch (error) {
    logger.error("팀 일정 삭제 중 오류 발생:", error);
    res.status(500).json({ message: "팀 일정 삭제 중 오류 발생" });
  }
};

export const updateTeamSchedule = async (req, res) => {
  try {
    const { clubId, teamId, teamScheduleId } = req.params;
    const dto = new teamScheduleDto(req.body);

    const result = await teamScheduleService.updateTeamSchedule(
      teamScheduleId,
      dto
    );
    logger.debug("팀 일정이 수정되었습니다.");
    res.status(200).json(result);
  } catch (error) {
    logger.error("팀 일정 수정 중 오류 발생:", error);
    res.status(500).json({ message: "팀 일정 수정 중 오류 발생" });
  }
};

export const adjustSchedule = async (req, res) => {
  try {
    const { clubId, teamId } = req.params;
    const { day } = req.query;

    const result = await teamScheduleService.adjustTeamSchedule(teamId, day);
    logger.debug("팀 일정 조율을 성공했습니다.");
    return res.json(result);
  } catch (error) {
    logger.error("팀 일정 조정 중 오류 발생:", error);
    return res.status(500).json({ message: "팀 일정 조정 중 오류 발생" });
  }
};

/*timeField 클라이언트 디코딩
 const base91chars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~\"";

const base91DecodeTable = (() => {
  const table = {};
  for (let i = 0; i < base91chars.length; i++) {
    table[base91chars[i]] = i;
  }
  return table;
})();

export function decodeBase91(encoded) {
  let v = -1, b = 0, n = 0;
  const output = [];

  for (let i = 0; i < encoded.length; i++) {
    const c = encoded[i];
    if (!(c in base91DecodeTable)) continue;

    if (v < 0) {
      v = base91DecodeTable[c];
    } else {
      v += base91DecodeTable[c] * 91;
      b |= v << n;
      n += (v & 8191) > 88 ? 13 : 14;

      while (n >= 8) {
        output.push(b & 255);
        b >>= 8;
        n -= 8;
      }

      v = -1;
    }
  }

  if (v >= 0) {
    b |= v << n;
    n += 7;
    while (n >= 8) {
      output.push(b & 255);
      b >>= 8;
      n -= 8;
    }
  }

  return output;
}
*/
/*encodedEvents 클라이언트 디코딩
const decodeEvent = (encoded) => {
  const decoded = atob(encoded);
  return decoded.split(";").map((item) => {
    const [usersStr, lenStr, startStr] = item.split("|");
    return [usersStr.split(",").map(Number), Number(lenStr), Number(startStr)];
  });
};
*/
