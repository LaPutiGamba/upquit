import DomainEvent from "../../../../shared/domain/events/DomainEvent.js";

export default class CommentCreatedEvent implements DomainEvent {
  public readonly eventName = "comment.created";
  public readonly occurredOn: Date;

  constructor(
    public readonly commentId: string,
    public readonly requestId: string,
    public readonly userId: string,
    public readonly parentId: string | null,
    public readonly isAdminReply: boolean | null
  ) {
    this.occurredOn = new Date();
  }
}
