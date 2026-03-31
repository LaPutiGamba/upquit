export default class CreateCommentCommand {
  constructor(
    readonly requestId: string,
    readonly userId: string,
    readonly content: string,
    readonly parentId: string | null = null,
    readonly isAdminReply: boolean | null = null
  ) {}
}
