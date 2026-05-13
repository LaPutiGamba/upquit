export default class JoinPublicBoardCommand {
  constructor(
    readonly boardId: string,
    readonly requesterUserId: string
  ) {}
}
