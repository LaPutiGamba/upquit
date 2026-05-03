import DomainEvent from "../../../../shared/domain/events/DomainEvent.js";

export default class RequestCreatedEvent implements DomainEvent {
  public readonly eventName = "request.created";
  public readonly occurredOn: Date;

  constructor(
    public readonly requestId: string,
    public readonly boardId: string,
    public readonly authorId: string,
    public readonly title: string
  ) {
    this.occurredOn = new Date();
  }
}
