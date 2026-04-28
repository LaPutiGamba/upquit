import DomainEvent from "../../../../shared/domain/events/DomainEvent.js";

export default class RequestDeletedEvent implements DomainEvent {
  public readonly eventName = "request.deleted";
  public readonly occurredOn: Date;

  constructor(public readonly requestId: string) {
    this.occurredOn = new Date();
  }
}
