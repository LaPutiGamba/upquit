import RealtimePublisher from "../../domain/contracts/RealtimePublisher.js";
import { getWebSocketServer } from "../websocket/WebSocketServerRegistry.js";
import { RealtimePayload } from "../../domain/contracts/RealtimePayload.js";

export default class WebSocketRealtimePublisher implements RealtimePublisher {
  constructor() {}

  public publish<T = Record<string, unknown>>(channel: string, event: string, payload: RealtimePayload<T>): void {
    const webSocketServer = getWebSocketServer();

    if (!webSocketServer) {
      console.warn("⚠️ Intento de emitir WS pero el servidor WebSocket no está inicializado.");
      return;
    }

    webSocketServer.broadcast(channel, event, payload);
  }
}
