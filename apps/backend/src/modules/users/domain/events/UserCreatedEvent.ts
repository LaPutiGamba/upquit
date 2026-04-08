import DomainEvent from "../../../../shared/domain/events/DomainEvent.js";

export default class UserCreatedEvent implements DomainEvent {
  public readonly eventName = "user.created";
  public readonly occurredOn: Date;

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly displayName: string,
  ) {
    this.occurredOn = new Date();
  }
}
