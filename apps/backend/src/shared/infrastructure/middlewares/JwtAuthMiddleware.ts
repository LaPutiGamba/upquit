import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      tenantId?: string;
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
    const decoded = jwt.verify(token, secret) as {
      sub: string;
      boardIds: string[];
      isAdmin?: boolean;
      role?: string;
    };

    const requestedTenantIdHeader = req.headers["x-tenant-id"];
    const requestedTenantId =
      typeof requestedTenantIdHeader === "string"
        ? requestedTenantIdHeader
        : Array.isArray(requestedTenantIdHeader)
          ? requestedTenantIdHeader[0]
          : undefined;

    const boardIds = Array.isArray(decoded.boardIds) ? decoded.boardIds : [];
    const isAdmin = decoded.isAdmin === true || decoded.role === "ADMIN";

    if (requestedTenantId) {
      const canAccessTenant = boardIds.includes(requestedTenantId);

      if (!canAccessTenant && !isAdmin) {
        res.status(403).send({
          error: "FORBIDDEN",
          message: "You are not allowed to access this tenant"
        });
        return;
      }

      req.tenantId = requestedTenantId;
    }

    req.userId = decoded.sub;

    next();
  } catch (error) {
    res.status(401).send({ error: "UNAUTHORIZED", message: "Invalid or expired token" });
    return;
  }
};
