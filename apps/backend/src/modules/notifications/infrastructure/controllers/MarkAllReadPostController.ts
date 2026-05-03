import { Request, Response } from "express";
import { notificationRepository } from "../../../../shared/infrastructure/dependencies.js";

export default async function MarkAllReadPostController(req: Request, res: Response) {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: { message: "Unauthorized" } });

  const boardId = req.body.boardId ? String(req.body.boardId) : undefined;

  await notificationRepository.markAllAsRead(userId, boardId);

  res.json({ ok: true });
}
