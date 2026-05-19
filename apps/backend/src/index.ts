import "dotenv/config.js";

import { createServer } from "http";
import { app } from "./app.js";
import pino from "pino";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });
const PORT = process.env.BACKEND_PORT || 3000;

const startServer = () => {
  try {
    const httpServer = createServer(app);

    httpServer.listen(PORT, () => {
      logger.info(`🚀 Backend server is running on http://localhost:${PORT}`);
    });

    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      httpServer.close(() => {
        logger.info("HTTP Server closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
