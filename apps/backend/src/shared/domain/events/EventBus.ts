import DomainEvent from "./DomainEvent.js";

export default interface EventBus {
  publish(events: DomainEvent[]): Promise<void>;
  subscribe<T extends DomainEvent>(eventName: string, handler: (event: T) => Promise<void>): void;
}
