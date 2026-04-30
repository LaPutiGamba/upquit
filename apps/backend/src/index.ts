import "dotenv/config";
import { createServer } from "http";
import { app } from "./app.js";
import WebSocketServer from "./shared/infrastructure/websocket/WebSocketServer.js";
import { registerWebSocketServer } from "./shared/infrastructure/websocket/WebSocketServerRegistry.js";

const PORT = process.env.BACKEND_PORT || 3000;

const startServer = () => {
  try {
    const httpServer = createServer(app);
    const webSocketServer = new WebSocketServer(httpServer);
    registerWebSocketServer(webSocketServer);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
