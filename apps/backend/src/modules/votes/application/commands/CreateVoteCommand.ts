export default class CreateVoteCommand {
  constructor(
    readonly requestId: string,
    readonly userId: string,
    readonly boardId: string
  ) {}
}
