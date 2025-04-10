export class CreateTeamDTO {
  constructor({ teamName, members }) {
    this.teamName = teamName;
    this.members = members;
  }
}

export class UpdateTeamDTO {
  constructor({ teamName }) {
    this.teamName = teamName;
  }
}
