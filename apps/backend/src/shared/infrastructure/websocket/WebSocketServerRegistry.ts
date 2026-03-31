import WebSocketServer from "./WebSocketServer.js";

let webSocketServer: WebSocketServer | null = null;

export const registerWebSocketServer = (server: WebSocketServer): void => {
  webSocketServer = server;
};

export const getWebSocketServer = (): WebSocketServer | null => {
  return webSocketServer;
};
