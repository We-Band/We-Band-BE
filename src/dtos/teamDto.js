export class createTeamDTO {
  constructor({ teamName, members, clubId }) {
    this.teamName = teamName;
    this.members = members;
    this.clubId = clubId;
  }
}

export class teamProfileDTO {
  constructor({ teamId, teamImg }) {
    this.teamId = teamId;
    this.teamImg = teamImg;
  }
}
