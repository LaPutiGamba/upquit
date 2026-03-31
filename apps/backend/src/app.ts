import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import pino from "pino";
import usersRouter from "./modules/users/infrastructure/usersRoutes.js";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8081",
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(pinoHttp({ logger }));

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/users", usersRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    }
  });
});
