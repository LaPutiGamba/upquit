import DomainEvent from "../../../../shared/domain/events/DomainEvent.js";

export default class VoteDeletedEvent implements DomainEvent {
  public readonly eventName = "vote.deleted";
  public readonly occurredOn: Date;

  constructor(
    public readonly voteId: string,
    public readonly requestId: string,
    public readonly userId: string,
    public readonly boardId: string
  ) {
    this.occurredOn = new Date();
  }
}
