import DomainEvent from "../../../../shared/domain/events/DomainEvent.js";

export default class RequestUpdatedEvent implements DomainEvent {
  public readonly eventName = "request.updated";
  public readonly occurredOn: Date;

  constructor(
    public readonly requestId: string,
    public readonly boardId: string,
    public readonly actorId: string,
    public readonly authorId: string,
    public readonly title: string,
    public readonly changedFields: string[]
  ) {
    this.occurredOn = new Date();
  }
}
