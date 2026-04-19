export default class UpdateBoardMemberRoleCommand {
  constructor(
    readonly boardId: string,
    readonly targetUserId: string,
    readonly role: string,
    readonly requesterUserId: string
  ) {}
}
