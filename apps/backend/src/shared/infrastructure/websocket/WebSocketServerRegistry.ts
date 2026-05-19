import WebSocket from "ws";
import { RealtimePayload } from "../../domain/contracts/RealtimePayload.js";

type OutgoingBroadcastMessage = {
  channel: string;
  event: string;
  payload: any;
  timestamp: string;
};

const channelSubscriptions = new Map<string, Set<WebSocket>>();
const clientSubscriptions = new Map<WebSocket, Set<string>>();

export const registerWebSocketConnection = (socket: WebSocket): void => {
  clientSubscriptions.set(socket, new Set());

  socket.on("message", (rawMessage: RawData) => {
    handleClientMessage(socket, rawMessage);
  });

  socket.on("close", () => {
    removeClient(socket);
  });

  socket.on("error", () => {
    removeClient(socket);
  });
};

export const broadcast = <T = Record<string, unknown>>(channel: string, event: string, payload: RealtimePayload<T>): void => {
  const clients = channelSubscriptions.get(channel);
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
};

type IncomingClientMessage = {
  type: "SUBSCRIBE" | "UNSUBSCRIBE";
  channel: string;
};

function handleClientMessage(socket: WebSocket, rawMessage: RawData): void {
  let message: Partial<IncomingClientMessage>;

  try {
    const rawStr = rawDataToString(rawMessage);
    message = JSON.parse(rawStr) as Partial<IncomingClientMessage>;
  } catch {
    return;
  }

  if (typeof message.channel !== "string") {
    return;
  }

  if (message.type === "SUBSCRIBE") {
    subscribe(socket, message.channel);
    return;
  }

  if (message.type === "UNSUBSCRIBE") {
    unsubscribe(socket, message.channel);
  }
}

function subscribe(socket: WebSocket, channel: string): void {
  const subscribedChannels = clientSubscriptions.get(socket);
  if (!subscribedChannels) {
    return;
  }

  subscribedChannels.add(channel);

  const channelClients = channelSubscriptions.get(channel) ?? new Set<WebSocket>();
  channelClients.add(socket);
  channelSubscriptions.set(channel, channelClients);
}

function unsubscribe(socket: WebSocket, channel: string): void {
  const subscribedChannels = clientSubscriptions.get(socket);
  if (subscribedChannels) {
    subscribedChannels.delete(channel);
  }

  const channelClients = channelSubscriptions.get(channel);
  if (!channelClients) {
    return;
  }

  channelClients.delete(socket);

  if (channelClients.size === 0) {
    channelSubscriptions.delete(channel);
  }
}

function removeClient(socket: WebSocket): void {
  const subscribedChannels = clientSubscriptions.get(socket);
  if (!subscribedChannels) {
    return;
  }

  for (const channel of subscribedChannels) {
    const channelClients = channelSubscriptions.get(channel);
    if (!channelClients) {
      continue;
    }

    channelClients.delete(socket);

    if (channelClients.size === 0) {
      channelSubscriptions.delete(channel);
    }
  }

  clientSubscriptions.delete(socket);
}

function rawDataToString(rawData: RawData): string {
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

type RawData = string | Buffer | ArrayBuffer | Buffer[];