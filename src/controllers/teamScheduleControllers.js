import { teamScheduleService } from "../services/teamScheduleService.js";
import { logger } from "../../utils/logger.js";
import { teamScheduleDto } from "../dtos/teamScheduleDto.js";

export const viewClubSchedule = async (req, res) => {
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

export const addTemaSchedule = async (req, res) => {
  try {
    const { clubId, teamId } = req.params;
    const dto = new teamScheduleDto(req.body);

    const result = await teamScheduleService.createTeamSchedule(teamId, dto);
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

export const updateteamSchedule = async (req, res) => {
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

//팀 일정 조율 API (GET /clubs/:clubId/teams/:teamId/team-schedules/adjust?day=2025-03-10)
export const adjustSchedule = async (req, res) => {
  try {
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

    // 팀 맴버 user_id 배열로 변환
    const userIdsArray = userIds.map((user) => user.user_id);

    // 날짜 범위
    const inputDate = new Date(day);
    const dayOfWeek = inputDate.getDay();
    const startDate = new Date(inputDate);
    startDate.setDate(
      inputDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    );
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const timeData = Array(210).fill(0);
    const timeSlotUsers = Array(210)
      .fill(null)
      .map(() => new Set());

    //사용자 일정 조회
    const userSchedules = await prisma.userSchedule.findMany({
      where: {
        user_id: { in: userIdsArray },
        user_schedule_start: { gte: startDate, lte: endDate },
      },
      select: {
        user_id: true,
        user_schedule_start: true,
        user_schedule_end: true,
      },
      orderBy: {
        user_schedule_start: "asc",
      },
    });

    //사용자 이름 조회를 위한 key-value json map
    // user_id를 키로, user_name을 값으로 하는 객체 생성
    const userNames = await prisma.user.findMany({
      where: {
        user_id: { in: userIdsArray },
      },
      select: {
        user_id: true,
        user_name: true,
      },
    });

    const userNameMap = Object.fromEntries(
      userNames.map((user) => [user.user_id, user.user_name])
    );

    // 일정 겹치는지 조회
    for (const {
      user_id,
      user_schedule_start,
      user_schedule_end,
    } of userSchedules) {
      const startIdx = Math.floor(
        (new Date(user_schedule_start) - startDate) / (30 * 60 * 1000)
      );
      const length = Math.floor(
        (new Date(user_schedule_end) - new Date(user_schedule_start)) /
          (30 * 60 * 1000)
      );

      for (let i = startIdx; i < startIdx + length; i++) {
        if (i >= 0 && i < 210) {
          timeSlotUsers[i].add(user_id);
        }
      }
    }

    // 최소 2명 이상 가능한 시간대만 1로 표시
    for (let i = 0; i < 210; i++) {
      if (timeSlotUsers[i].size >= 2) {
        timeData[i] = 1;
      }
    }

    // 8비트 단위로 바이트 배열 생성
    const packedTimeData = [];
    for (let i = 0; i < timeData.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8; j++) {
        if (i + j < timeData.length) {
          byte |= timeData[i + j] << (7 - j);
        }
      }
      packedTimeData.push(byte);
    }

    // base91로 인코딩
    const timeField = encodeBase91(new Uint8Array(packedTimeData));

    // events: 가능한 연속 시간 구간 추출
    const events = [];
    let i = 0;
    while (i < 210) {
      if (timeData[i] === 1) {
        const start = i;
        let users = new Set([...timeSlotUsers[i]]);
        while (i < 210 && timeData[i] === 1) {
          users = new Set([...users].filter((u) => timeSlotUsers[i].has(u)));
          i++;
        }
        const len = i - start;
        if (users.size >= 2) {
          events.push([Array.from(users), users.size, start, len]);
        }
      } else {
        i++;
      }
    }

    const eventString = events
      .map(([users, count, start]) => `${users.join(",")}|${count}|${start}`)
      .join(";");
    const encodedEvents = Buffer.from(eventString).toString("base64");

    logger.debug("팀 일정 조정 데이터를 전송했습니다.");
    return res.json({
      userNameMap,
      timeData: timeField,
      events: encodedEvents,
    });
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
