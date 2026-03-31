import RealtimePublisher from "../../domain/contracts/RealtimePublisher.js";
import WebSocketServer from "../websocket/WebSocketServer.js";

export default class WebSocketRealtimePublisher implements RealtimePublisher {
  constructor(private readonly webSocketServer: WebSocketServer | null) {}

  public publish(channel: string, event: string, payload: any): void {
    if (!this.webSocketServer) {
      return;
    }

    this.webSocketServer.broadcast(channel, event, payload);
  }
}
