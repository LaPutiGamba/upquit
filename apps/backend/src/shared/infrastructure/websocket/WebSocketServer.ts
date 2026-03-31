import { Server as HttpServer } from "http";
import { RawData, WebSocketServer as WsServer, WebSocket } from "ws";

type IncomingClientMessage = {
  type: "SUBSCRIBE" | "UNSUBSCRIBE";
  channel: string;
};

type OutgoingBroadcastMessage = {
  channel: string;
  event: string;
  payload: any;
  timestamp: string;
};

export default class WebSocketServer {
  private readonly wsServer: WsServer;
  private readonly channelSubscriptions = new Map<string, Set<WebSocket>>();
  private readonly clientSubscriptions = new Map<WebSocket, Set<string>>();

  constructor(httpServer: HttpServer) {
    this.wsServer = new WsServer({ server: httpServer });
    this.wsServer.on("connection", (socket: WebSocket) => this.handleConnection(socket));
  }

  public broadcast(channel: string, event: string, payload: any): void {
    const clients = this.channelSubscriptions.get(channel);
    if (!clients || clients.size === 0) {
      return;
    }

    const message: OutgoingBroadcastMessage = {
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

  private handleConnection(socket: WebSocket): void {
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
  }

  private handleClientMessage(socket: WebSocket, rawMessage: string): void {
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

  private subscribe(socket: WebSocket, channel: string): void {
    const subscribedChannels = this.clientSubscriptions.get(socket);
    if (!subscribedChannels) {
      return;
    }

    subscribedChannels.add(channel);

    const channelClients = this.channelSubscriptions.get(channel) ?? new Set<WebSocket>();
    channelClients.add(socket);
    this.channelSubscriptions.set(channel, channelClients);
  }

  private unsubscribe(socket: WebSocket, channel: string): void {
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

  private removeClient(socket: WebSocket): void {
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
}
