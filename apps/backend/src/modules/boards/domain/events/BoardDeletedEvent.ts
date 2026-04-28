import DomainEvent from "../../../../shared/domain/events/DomainEvent.js";

export default class BoardDeletedEvent implements DomainEvent {
  public readonly eventName = "board.deleted";
  public readonly occurredOn: Date;

  constructor(public readonly boardId: string) {
    this.occurredOn = new Date();
  }
}
