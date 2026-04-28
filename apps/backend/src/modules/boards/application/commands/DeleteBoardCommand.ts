export default class DeleteBoardCommand {
  constructor(
    readonly boardId: string,
    readonly requesterUserId: string
  ) {}
}
