import { Request, Response, NextFunction } from "express";
import { withTenant } from "../database/connection.js";

export const TenantDbMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.tenantId) {
    next();
    return;
  }

  try {
    await withTenant(req.tenantId, async () => {
      await new Promise<void>((resolve) => {
        const cleanup = () => {
          res.off("finish", onFinished);
          res.off("close", onFinished);
        };

        const onFinished = () => {
          cleanup();
          resolve();
        };

        res.on("finish", onFinished);
        res.on("close", onFinished);

        next();
      });
    });
  } catch (error) {
    next(error);
  }
};
