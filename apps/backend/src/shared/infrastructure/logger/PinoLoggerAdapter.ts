import pino from "pino";
import Logger from "./Logger.js";

export default class PinoLogger implements Logger {
  private readonly pinoLogger: pino.Logger;

  constructor(pinoLogger: pino.Logger = pino({ level: process.env.LOG_LEVEL || "info" })) {
    this.pinoLogger = pinoLogger;
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.pinoLogger.info(data, message);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.pinoLogger.warn(data, message);
  }

  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    this.pinoLogger.error({ ...data, err: error }, message);
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.pinoLogger.debug(data, message);
  }
}
