export default class AddBoardMemberCommand {
  constructor(
    readonly boardId: string,
    readonly userId: string,
    readonly role: string
  ) {}
}
