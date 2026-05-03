import { Request, Response } from "express";
import { notificationRepository } from "../../../../shared/infrastructure/dependencies.js";

export default async function ListNotificationsGetController(req: Request, res: Response) {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: { message: "Unauthorized" } });

  const boardId = req.query.boardId ? String(req.query.boardId) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const offset = req.query.offset ? Number(req.query.offset) : 0;

  const list = await notificationRepository.listByUser(userId, { boardId, limit, offset });

  res.json({ data: list });
}
