export const createClubScheduleDto = (body) => {
  return {
    clubScheduleStart: new Date(body.clubScheduleStart),
    clubScheduleEnd: new Date(body.clubScheduleEnd),
    clubScheduleTitle: body.clubScheduleTitle,
    clubSchedulePlace: body.clubSchedulePlace || "",
  };
};
