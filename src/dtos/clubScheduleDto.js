export class clubScheduleDto {
  constructor(body) {
    this.clubScheduleStart = new Date(body.clubScheduleStart);
    this.clubrScheduleEnd = new Date(body.clubScheduleEnd);
    this.clubScheduleTitle = body.clubScheduleTitle;
    this.clubSchedulePlace = body.clubSchedulePlace || "";
  }
}
