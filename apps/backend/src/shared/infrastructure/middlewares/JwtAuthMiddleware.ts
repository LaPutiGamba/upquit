import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type JwtAuthPayload = {
  sub: string;
  userId: string;
  tenantId: string | null;
  boardIds: string[];
  iat?: number;
  exp?: number;
};

declare module "express-serve-static-core" {
  interface Request {
    auth?: JwtAuthPayload;
  }
}

export default function JwtAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.header("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).send({
      error: "UNAUTHORIZED",
      message: "Missing or invalid Authorization header"
    });
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    res.status(500).send({
      error: "JWT_SECRET_NOT_CONFIGURED",
      message: "JWT_SECRET environment variable is required"
    });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as JwtAuthPayload;
    req.auth = payload;
    next();
  } catch {
    res.status(401).send({
      error: "INVALID_TOKEN",
      message: "Token is invalid or expired"
    });
  }
}
