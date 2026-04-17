import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sql } from "drizzle-orm";
import { db } from "../database/connection.js";

const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
if (!jwtAccessSecret) {
  throw new Error("JWT_ACCESS_SECRET environment variable is required");
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      tenantId?: string;
    }
  }
}

async function hasTenantAccessInDb(userId: string, tenantId: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1
      FROM boards b
      WHERE b.id::text = ${tenantId}
        AND b.owner_id::text = ${userId}
      UNION ALL
      SELECT 1
      FROM board_members bm
      WHERE bm.board_id::text = ${tenantId}
        AND bm.user_id::text = ${userId}
    ) AS has_access
  `);

  return Boolean((result.rows[0] as { has_access?: boolean } | undefined)?.has_access);
}

export const JwtAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).send({ error: "UNAUTHORIZED", message: "Missing or invalid token format" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtAccessSecret) as {
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
      const canAccessFromToken = boardIds.includes(requestedTenantId);
      const canAccessFromDb = canAccessFromToken || (await hasTenantAccessInDb(decoded.sub, requestedTenantId));

      if (!canAccessFromDb && !isAdmin) {
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
