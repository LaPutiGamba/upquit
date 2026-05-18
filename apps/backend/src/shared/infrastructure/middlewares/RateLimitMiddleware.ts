import { Request, Response, NextFunction } from "express";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Max 3 requests per 15 minutes per email
const MAX_REQUESTS = 3;
const WINDOW_MS = 15 * 60 * 1000;

export function rateLimitForgotPassword(req: Request, res: Response, next: NextFunction): void {
  const email = req.body.email;

  if (!email || typeof email !== "string") {
    return next();
  }

  const key = `forgot-password:${email}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return next();
  }

  entry.count++;

  if (entry.count > MAX_REQUESTS) {
    res.status(429).json({
      error: "TOO_MANY_REQUESTS",
      message: "Too many password reset requests. Please try again later."
    });
    return;
  }

  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}, 60 * 1000); // Cleanup every minute
