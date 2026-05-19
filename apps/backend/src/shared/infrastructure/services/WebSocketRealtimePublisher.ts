import RealtimePublisher from "../../domain/contracts/RealtimePublisher.js";
import { broadcast } from "../websocket/WebSocketServerRegistry.js";
import { RealtimePayload } from "../../domain/contracts/RealtimePayload.js";

export default class WebSocketRealtimePublisher implements RealtimePublisher {
  constructor() {}

  public publish<T = Record<string, unknown>>(channel: string, event: string, payload: RealtimePayload<T>): void {
    broadcast(channel, event, payload);
  }
}