import Notification from "../entities/Notification.js";

export default interface INotificationRepository {
  create(notification: Notification): Promise<void>;
  listByUser(
    userId: string,
    opts?: { boardId?: string | null; limit?: number; offset?: number }
  ): Promise<Notification[]>;
  markAsRead(notificationId: string, userId: string): Promise<void>;
  markAllAsRead(userId: string, boardId?: string | null): Promise<void>;
  countUnread(userId: string, boardId?: string | null): Promise<number>;
}
