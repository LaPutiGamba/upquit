import { Request, Response } from "express";
import { notificationRepository } from "../../../../shared/infrastructure/dependencies.js";

export default async function MarkNotificationReadPatchController(req: Request, res: Response) {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: { message: "Unauthorized" } });

  const rawId = req.params.id;
  if (!rawId) return res.status(400).json({ error: { message: "Missing id" } });

  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  await notificationRepository.markAsRead(id, userId);

  res.json({ ok: true });
}
