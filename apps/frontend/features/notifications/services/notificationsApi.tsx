import { apiClient } from "@/shared/lib/apiClient";

export interface NotificationItem {
  id: string;
  userId: string;
  boardId?: string | null;
  type: string;
  payload: {
    title?: string;
    body?: string;
    [key: string]: unknown;
  };
  read: boolean;
  createdAt: string;
}

export async function getNotifications(boardId?: string, limit = 10, offset = 0): Promise<NotificationItem[]> {
  const params = new URLSearchParams();
  if (boardId) params.set("boardId", boardId);
  params.set("limit", String(limit));
  params.set("offset", String(offset));

  const response = await apiClient<{ data: NotificationItem[] }>(`/notifications?${params.toString()}`, {
    method: "GET"
  });

  return response.data ?? [];
}

export async function getUnreadCount(boardId?: string): Promise<number> {
  const params = new URLSearchParams();
  if (boardId) params.set("boardId", boardId);

  const response = await apiClient<{ count: number }>(`/notifications/unread-count?${params.toString()}`, {
    method: "GET"
  });

  return response.count ?? 0;
}

export async function markAsRead(id: string): Promise<void> {
  await apiClient(`/notifications/${id}/read`, {
    method: "PATCH"
  });
}

export async function markAllRead(boardId?: string): Promise<void> {
  await apiClient(`/notifications/read-all`, {
    method: "POST",
    body: JSON.stringify({ boardId })
  });
}
