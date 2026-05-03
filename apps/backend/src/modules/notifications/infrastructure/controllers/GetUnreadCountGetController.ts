import { Request, Response } from "express";
import { notificationRepository } from "../../../../shared/infrastructure/dependencies.js";

export default async function GetUnreadCountGetController(req: Request, res: Response) {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: { message: "Unauthorized" } });

  const boardId = req.query.boardId ? String(req.query.boardId) : undefined;
  const count = await notificationRepository.countUnread(userId, boardId);

  res.json({ count });
}
