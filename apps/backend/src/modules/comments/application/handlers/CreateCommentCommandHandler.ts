import Comment from "../../domain/entities/Comment.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";
import CommentRepository from "../../domain/contracts/CommentRepository.js";
import CreateCommentCommand from "../commands/CreateCommentCommand.js";
import CommentResponse, { mapCommentToResponse } from "../responses/CommentResponse.js";
import EventBus from "../../../../shared/domain/events/EventBus.js";
import CommentCreatedEvent from "../../domain/events/CommentCreatedEvent.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import CommentNotFoundException from "../exceptions/CommentNotFoundException.js";

export default class CreateCommentCommandHandler {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly realtimePublisher: RealtimePublisher,
    private readonly eventBus: EventBus
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

    const createdCommentWithAuthor = await this.commentRepository.findByIdWithAuthor(new Uuid(comment.id.getValue()));
    if (!createdCommentWithAuthor) {
      throw new CommentNotFoundException(comment.id.getValue());
    }

    const response = mapCommentToResponse(
      createdCommentWithAuthor.comment,
      createdCommentWithAuthor.authorDisplayName,
      createdCommentWithAuthor.authorAvatarUrl
    );

    this.realtimePublisher.publish(command.requestId, "CommentAdded", {
      requestId: command.requestId,
      comment: response
    });

    await this.eventBus.publish([
      new CommentCreatedEvent(
        response.id,
        response.requestId,
        response.userId,
        response.parentId,
        response.isAdminReply
      )
    ]);

    return response;
  }
}
