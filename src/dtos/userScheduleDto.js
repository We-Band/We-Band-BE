export class CreateUserScheduleDto {
  constructor(body) {
    this.userScheduleStart = new Date(body.userScheduleStart);
    this.userScheduleEnd = new Date(body.userScheduleEnd);
    this.userScheduleTitle = body.userScheduleTitle;
    this.userSchedulePlace = body.userSchedulePlace || "";
    this.userScheduleParticipants = body.userScheduleParticipants || "";
    this.isPublic = body.isPublic ?? true;
  }
}

export class UpdateUserScheduleDto {
  constructor(body) {
    this.userScheduleStart = new Date(body.userScheduleStart);
    this.userScheduleEnd = new Date(body.userScheduleEnd);
    this.userScheduleTitle = body.userScheduleTitle;
    this.userSchedulePlace = body.userSchedulePlace || "";
    this.userScheduleParticipants = body.userScheduleParticipants || "";
    this.isPublic = body.isPublic ?? true;
  }
}
