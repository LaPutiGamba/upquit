import { RawData, WebSocket } from "ws";
import { RealtimePayload } from "../../domain/contracts/RealtimePayload.js";

type AliveWebSocket = WebSocket & {
  isAlive: boolean;
};

type IncomingClientMessage = {
  type: "SUBSCRIBE" | "UNSUBSCRIBE";
  channel: string;
};

type OutgoingBroadcastMessage<T> = {
  channel: string;
  event: string;
  payload: RealtimePayload<T>;
  timestamp: string;
};

export default class WebSocketServer {
  private readonly channelSubscriptions = new Map<string, Set<AliveWebSocket>>();
  private readonly clientSubscriptions = new Map<AliveWebSocket, Set<string>>();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(private readonly socket: AliveWebSocket) {
    this.handleConnection(socket);
    this.startHeartbeat();
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket.readyState !== WebSocket.OPEN) {
        return;
      }

      if (!this.socket.isAlive) {
        this.socket.terminate();
        return;
      }

      this.socket.isAlive = false;
      this.socket.ping();
    }, 30000);
  }

  public broadcast<T = Record<string, unknown>>(channel: string, event: string, payload: RealtimePayload<T>): void {
    const clients = this.channelSubscriptions.get(channel);
    if (!clients || clients.size === 0) {
      return;
    }

    const message: OutgoingBroadcastMessage<T> = {
      channel,
      event,
      payload,
      timestamp: new Date().toISOString()
    };

    const serializedMessage = JSON.stringify(message);

    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(serializedMessage);
      }
    }
  }

  private handleConnection(socket: AliveWebSocket): void {
    socket.isAlive = true;
    this.clientSubscriptions.set(socket, new Set());

    socket.on("message", (rawMessage: RawData) => {
      this.handleClientMessage(socket, this.rawDataToString(rawMessage));
    });

    socket.on("close", () => {
      this.removeClient(socket);
    });

    socket.on("error", () => {
      this.removeClient(socket);
    });

    socket.on("pong", () => {
      socket.isAlive = true;
    });
  }

  private handleClientMessage(socket: AliveWebSocket, rawMessage: string): void {
    let message: Partial<IncomingClientMessage>;

    try {
      message = JSON.parse(rawMessage) as Partial<IncomingClientMessage>;
    } catch {
      return;
    }

    if (typeof message.channel !== "string") {
      return;
    }

    if (message.type === "SUBSCRIBE") {
      this.subscribe(socket, message.channel);
      return;
    }

    if (message.type === "UNSUBSCRIBE") {
      this.unsubscribe(socket, message.channel);
    }
  }

  private subscribe(socket: AliveWebSocket, channel: string): void {
    const subscribedChannels = this.clientSubscriptions.get(socket);
    if (!subscribedChannels) {
      return;
    }

    subscribedChannels.add(channel);

    const channelClients = this.channelSubscriptions.get(channel) ?? new Set<AliveWebSocket>();
    channelClients.add(socket);
    this.channelSubscriptions.set(channel, channelClients);
  }

  private unsubscribe(socket: AliveWebSocket, channel: string): void {
    const subscribedChannels = this.clientSubscriptions.get(socket);
    if (subscribedChannels) {
      subscribedChannels.delete(channel);
    }

    const channelClients = this.channelSubscriptions.get(channel);
    if (!channelClients) {
      return;
    }

    channelClients.delete(socket);

    if (channelClients.size === 0) {
      this.channelSubscriptions.delete(channel);
    }
  }

  private removeClient(socket: AliveWebSocket): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    const subscribedChannels = this.clientSubscriptions.get(socket);
    if (!subscribedChannels) {
      return;
    }

    for (const channel of subscribedChannels) {
      const channelClients = this.channelSubscriptions.get(channel);
      if (!channelClients) {
        continue;
      }

      channelClients.delete(socket);

      if (channelClients.size === 0) {
        this.channelSubscriptions.delete(channel);
      }
    }

    this.clientSubscriptions.delete(socket);
  }

  private rawDataToString(rawData: RawData): string {
    if (typeof rawData === "string") {
      return rawData;
    }

    if (rawData instanceof ArrayBuffer) {
      return Buffer.from(rawData).toString("utf-8");
    }

    if (Array.isArray(rawData)) {
      return Buffer.concat(rawData).toString("utf-8");
    }

    return rawData.toString("utf-8");
  }

  public destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}
