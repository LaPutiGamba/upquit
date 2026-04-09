export default class DeleteCommentCommand {
  constructor(
    readonly commentId: string,
    readonly userId: string
  ) {}
}
