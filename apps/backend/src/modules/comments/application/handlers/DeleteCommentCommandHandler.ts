import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";
import CommentRepository from "../../domain/contracts/CommentRepository.js";
import DeleteCommentCommand from "../commands/DeleteCommentCommand.js";
import CommentNotFoundException from "../exceptions/CommentNotFoundException.js";

export default class DeleteCommentCommandHandler {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly realtimePublisher: RealtimePublisher
  ) {}

  async execute(command: DeleteCommentCommand): Promise<void> {
    const commentId = new Uuid(command.commentId);
    const comment = await this.commentRepository.findById(commentId);

    if (!comment) {
      throw new CommentNotFoundException(command.commentId);
    }

    await this.commentRepository.delete(commentId);

    this.realtimePublisher.publish(comment.requestId.getValue(), "COMMENT_DELETED", {
      requestId: comment.requestId.getValue(),
      commentId: comment.id.getValue()
    });
  }
}
