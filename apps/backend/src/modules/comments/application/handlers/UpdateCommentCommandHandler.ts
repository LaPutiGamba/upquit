import Comment from "../../domain/entities/Comment.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import CommentRepository from "../../domain/contracts/CommentRepository.js";
import UpdateCommentCommand from "../commands/UpdateCommentCommand.js";
import CommentNotFoundException from "../exceptions/CommentNotFoundException.js";
import CommentResponse, { mapCommentToResponse } from "../responses/CommentResponse.js";

export default class UpdateCommentCommandHandler {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(command: UpdateCommentCommand): Promise<CommentResponse> {
    const commentId = new Uuid(command.commentId);
    const comment = await this.commentRepository.findById(commentId);

    if (!comment) {
      throw new CommentNotFoundException(command.commentId);
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

    return mapCommentToResponse(updatedComment);
  }
}
