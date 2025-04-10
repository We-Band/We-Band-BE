import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 동아리 가입 API (POST /clubs)
export class joinClubDTO {
  constructor(clubCode, userId) {
    this.clubCode = clubCode;
    this.userId = userId;
  }
}

//동아리 가입 코드 수정 API (PATCH /clubs/:clubId/setting)
export class ChangeCodeDTO {
  constructor({ newCode }) {
    if (!newCode)
      throw { status: 400, message: "동아리 가입 코드가 필요합니다." };
    this.newCode = newCode;
  }
}

//동아리 회장 변경 API (PATCH /clubs/:clubId/leader)
export class ChangeLeaderDTO {
  constructor({ newLeader }) {
    if (!newLeader)
      throw {
        status: 400,
        message: "회장으로 임명할 사용자 정보가 누락 되었습니다.",
      };
    this.newLeader = newLeader;
  }
}
