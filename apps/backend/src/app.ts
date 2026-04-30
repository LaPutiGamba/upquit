import express, { Request, Response, NextFunction } from "express";

import "./shared/infrastructure/dependencies.js";

import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import pino from "pino";
import usersRouter from "./modules/users/infrastructure/usersRoutes.js";
import boardsRouter from "./modules/boards/infrastructure/boardsRoutes.js";
import commentsRouter from "./modules/comments/infrastructure/commentsRoutes.js";
import giveToGetRouter from "./modules/give-to-get/infrastructure/giveToGetRoutes.js";
import requestsRouter from "./modules/requests/infrastructure/requestsRoutes.js";
import votesRouter from "./modules/votes/infrastructure/votesRoutes.js";
import DomainException from "./shared/domain/exceptions/DomainException.js";
import ApplicationException from "./shared/application/exceptions/ApplicationException.js";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000"
      ].filter(Boolean);
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
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
app.use("/boards", boardsRouter);
app.use("/comments", commentsRouter);
app.use("/give-to-get", giveToGetRouter);
app.use("/requests", requestsRouter);
app.use("/votes", votesRouter);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);

  const errorWithMetadata =
    typeof err === "object" && err !== null
      ? (err as { statusCode?: number; message?: string; stack?: string })
      : undefined;

  const statusCode = errorWithMetadata?.statusCode ?? 500;
  const isControlledError = err instanceof DomainException || err instanceof ApplicationException;
  const message =
    statusCode === 500 && !isControlledError
      ? "Internal Server Error"
      : (errorWithMetadata?.message ?? "Internal Server Error");

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: errorWithMetadata?.stack })
    }
  });
});
