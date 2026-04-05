import EventBus from "../../domain/events/EventBus.js";
import DomainEvent from "../../domain/events/DomainEvent.js";

export default class InMemoryAsyncEventBus implements EventBus {
  private handlers: Map<string, Array<(event: any) => Promise<void>>> = new Map();

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const eventHandlers = this.handlers.get(event.eventName) || [];

      const results = await Promise.allSettled(eventHandlers.map((handler) => handler(event)));

      results.forEach((result) => {
        if (result.status === "rejected") {
          console.error(`[EventBus] Error procesando evento ${event.eventName}:`, result.reason);
        }
      });
    }
  }

  subscribe<T extends DomainEvent>(eventName: string, handler: (event: T) => Promise<void>): void {
    const currentHandlers = this.handlers.get(eventName) || [];
    currentHandlers.push(handler);
    this.handlers.set(eventName, currentHandlers);
  }
}
