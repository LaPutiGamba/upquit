import Comment from "../../domain/entities/Comment.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";
import CommentRepository from "../../domain/contracts/CommentRepository.js";
import UpdateCommentCommand from "../commands/UpdateCommentCommand.js";
import CommentNotFoundException from "../exceptions/CommentNotFoundException.js";
import CommentResponse, { mapCommentToResponse } from "../responses/CommentResponse.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";

export default class UpdateCommentCommandHandler {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly realtimePublisher: RealtimePublisher
  ) {}

  async execute(command: UpdateCommentCommand): Promise<CommentResponse> {
    const commentId = new Uuid(command.commentId);
    const comment = await this.commentRepository.findById(commentId);

    if (!comment) {
      throw new CommentNotFoundException(command.commentId);
    }

    if (comment.userId.getValue() !== command.userId) {
      throw new UnauthorizedActionException("You can only update your own comments");
    }

    const updatedComment = new Comment(
      comment.id.getValue(),
      comment.requestId.getValue(),
      comment.userId.getValue(),
      comment.parentId?.getValue() ?? null,
      command.content ?? comment.content,
      command.isAdminReply !== undefined ? command.isAdminReply : comment.isAdminReply,
      comment.createdAt
    );

    await this.commentRepository.update(updatedComment);

    const response = mapCommentToResponse(updatedComment);

    this.realtimePublisher.publish(updatedComment.requestId.getValue(), "COMMENT_UPDATED", {
      requestId: updatedComment.requestId.getValue(),
      comment: response
    });

    return response;
  }
}
