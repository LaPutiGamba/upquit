export default class RemoveBoardMemberCommand {
  constructor(
    readonly boardId: string,
    readonly targetUserId: string,
    readonly requesterUserId: string
  ) {}
}
