// upquit/apps/backend/src/shared/infrastructure/middlewares/JwtAuthMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const JwtAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).send({ error: "UNAUTHORIZED", message: "Missing or invalid token format" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, secret) as { sub: string };

    req.userId = decoded.sub;

    next();
  } catch (error) {
    res.status(401).send({ error: "UNAUTHORIZED", message: "Invalid or expired token" });
    return;
  }
};
