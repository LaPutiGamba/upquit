import Comment from "../../domain/entities/Comment.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";
import CommentRepository from "../../domain/contracts/CommentRepository.js";
import CreateCommentCommand from "../commands/CreateCommentCommand.js";
import CommentResponse, { mapCommentToResponse } from "../responses/CommentResponse.js";

export default class CreateCommentCommandHandler {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly realtimePublisher: RealtimePublisher
  ) {}

  async execute(command: CreateCommentCommand): Promise<CommentResponse> {
    const comment = new Comment(
      crypto.randomUUID(),
      command.requestId,
      command.userId,
      command.parentId,
      command.content,
      command.isAdminReply ?? null,
      new Date()
    );

    await this.commentRepository.save(comment);

    const response = mapCommentToResponse(comment);

    this.realtimePublisher.publish(command.requestId, "COMMENT_ADDED", {
      requestId: command.requestId,
      comment: response
    });

    return response;
  }
}
