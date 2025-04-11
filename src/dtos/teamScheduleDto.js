export class teamScheduleDto {
  constructor(body) {
    this.teamScheduleStart = new Date(body.teamScheduleStart);
    this.teamScheduleEnd = new Date(body.teamScheduleEnd);
    this.teamScheduleTitle = body.teamScheduleTitle;
    this.teamSchedulePlace = body.teamSchedulePlace || "";
    this.teamScheduleParticipants = body.teamScheduleParticipants || "";
  }
}
