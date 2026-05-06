import EventBus from "../../domain/events/EventBus.js";
import DomainEvent from "../../domain/events/DomainEvent.js";
import pino from "pino";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

export default class InMemoryAsyncEventBus implements EventBus {
  private handlers: Map<string, Array<(event: DomainEvent) => Promise<void>>> = new Map();

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const eventHandlers = this.handlers.get(event.eventName) || [];

      const results = await Promise.allSettled(eventHandlers.map((handler) => handler(event)));

      results.forEach((result) => {
        if (result.status === "rejected") {
          logger.error({ err: result.reason }, `Error processing event ${event.eventName}`);
        }
      });
    }
  }

  subscribe<T extends DomainEvent>(eventName: string, handler: (event: T) => Promise<void>): void {
    const currentHandlers = this.handlers.get(eventName) || [];
    currentHandlers.push(handler as (event: DomainEvent) => Promise<void>);
    this.handlers.set(eventName, currentHandlers);
  }
}
