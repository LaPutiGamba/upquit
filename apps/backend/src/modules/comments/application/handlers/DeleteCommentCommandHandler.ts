import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";
import CommentRepository from "../../domain/contracts/CommentRepository.js";
import DeleteCommentCommand from "../commands/DeleteCommentCommand.js";
import CommentNotFoundException from "../exceptions/CommentNotFoundException.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";
import EventBus from "../../../../shared/domain/events/EventBus.js";
import CommentDeletedEvent from "../../domain/events/CommentDeletedEvent.js";

export default class DeleteCommentCommandHandler {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly realtimePublisher: RealtimePublisher,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: DeleteCommentCommand): Promise<void> {
    const commentId = new Uuid(command.commentId);
    const comment = await this.commentRepository.findById(commentId);

    if (!comment) {
      throw new CommentNotFoundException(command.commentId);
    }

    if (comment.userId.getValue() !== command.userId) {
      throw new UnauthorizedActionException("You can only delete your own comments");
    }

    await this.commentRepository.delete(commentId);

    this.realtimePublisher.publish(comment.requestId.getValue(), "COMMENT_DELETED", {
      requestId: comment.requestId.getValue(),
      commentId: comment.id.getValue()
    });

    await this.eventBus.publish([
      new CommentDeletedEvent(
        comment.id.getValue(),
        comment.requestId.getValue(),
        comment.userId.getValue(),
        comment.parentId?.getValue() ?? null,
        comment.isAdminReply
      )
    ]);
  }
}
