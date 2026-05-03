import { and, desc, eq, sql } from "drizzle-orm";
import type { CurrentDatabase } from "../../../../shared/infrastructure/database/connection.js";
import type INotificationRepository from "../../domain/contracts/INotificationRepository.js";
import Notification from "../../domain/entities/Notification.js";
import { notifications } from "../schema.js";

export default class NotificationDrizzleRepository implements INotificationRepository {
  constructor(private readonly db: CurrentDatabase) {}

  async create(notification: Notification): Promise<void> {
    await this.db.insert(notifications).values({
      id: notification.id,
      userId: notification.userId,
      boardId: notification.boardId ?? null,
      type: notification.type,
      payload: notification.payload ?? {},
      read: notification.read,
      createdAt: new Date(notification.createdAt)
    });
  }

  async listByUser(
    userId: string,
    opts?: { boardId?: string | null; limit?: number; offset?: number }
  ): Promise<Notification[]> {
    const limit = opts?.limit ?? 20;
    const offset = opts?.offset ?? 0;

    const whereClause = opts?.boardId
      ? and(eq(notifications.userId, userId), eq(notifications.boardId, opts.boardId))
      : eq(notifications.userId, userId);

    const rows = await this.db
      .select()
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return rows.map(
      (row) =>
        new Notification({
          id: row.id,
          userId: row.userId,
          boardId: row.boardId,
          type: row.type,
          payload: row.payload,
          read: row.read ?? false,
          createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString()
        })
    );
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.db
      .update(notifications)
      .set({ read: true, readAt: new Date() })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  }

  async markAllAsRead(userId: string, boardId?: string | null): Promise<void> {
    const whereClause = boardId
      ? and(eq(notifications.userId, userId), eq(notifications.boardId, boardId), eq(notifications.read, false))
      : and(eq(notifications.userId, userId), eq(notifications.read, false));

    await this.db.update(notifications).set({ read: true, readAt: new Date() }).where(whereClause);
  }

  async countUnread(userId: string, boardId?: string | null): Promise<number> {
    const whereClause = boardId
      ? and(eq(notifications.userId, userId), eq(notifications.boardId, boardId), eq(notifications.read, false))
      : and(eq(notifications.userId, userId), eq(notifications.read, false));

    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(whereClause);

    return Number(row?.count ?? 0);
  }
}
