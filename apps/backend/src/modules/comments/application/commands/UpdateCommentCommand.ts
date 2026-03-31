export default class UpdateCommentCommand {
  constructor(
    readonly commentId: string,
    readonly content?: string,
    readonly isAdminReply?: boolean | null
  ) {}
}
