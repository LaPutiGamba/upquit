import DomainEvent from "../../../../shared/domain/events/DomainEvent.js";

export default class CommentDeletedEvent implements DomainEvent {
  public readonly eventName = "comment.deleted";
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
