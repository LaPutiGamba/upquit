import Notification from "../../domain/entities/Notification.js";
import type INotificationRepository from "../../domain/contracts/INotificationRepository.js";

export default class InMemoryNotificationRepository implements INotificationRepository {
  private store: Map<string, Notification[]> = new Map();

  async create(notification: Notification): Promise<void> {
    const arr = this.store.get(notification.userId) ?? [];
    arr.unshift(notification);
    this.store.set(notification.userId, arr);
  }

  async listByUser(
    userId: string,
    opts?: { boardId?: string | null; limit?: number; offset?: number }
  ): Promise<Notification[]> {
    const arr = this.store.get(userId) ?? [];
    let filtered = arr;
    if (opts?.boardId) filtered = filtered.filter((n) => n.boardId === opts.boardId);
    const offset = opts?.offset ?? 0;
    const limit = opts?.limit ?? 20;
    return filtered.slice(offset, offset + limit);
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const arr = this.store.get(userId) ?? [];
    const item = arr.find((n) => n.id === notificationId);
    if (item) item.read = true;
  }

  async markAllAsRead(userId: string, boardId?: string | null): Promise<void> {
    const arr = this.store.get(userId) ?? [];
    for (const n of arr) {
      if (!boardId || n.boardId === boardId) n.read = true;
    }
  }

  async countUnread(userId: string, boardId?: string | null): Promise<number> {
    const arr = this.store.get(userId) ?? [];
    return arr.filter((n) => !n.read && (boardId ? n.boardId === boardId : true)).length;
  }
}
