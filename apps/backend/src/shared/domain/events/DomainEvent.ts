export default interface DomainEvent {
  readonly eventName: string;
  readonly occurredOn: Date;
}
