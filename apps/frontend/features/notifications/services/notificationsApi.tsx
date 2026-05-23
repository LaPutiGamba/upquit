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

export interface NotificationFilters {
  boardId?: string;
  read?: boolean;
  type?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getNotifications(filters?: NotificationFilters): Promise<NotificationItem[]> {
  const params = new URLSearchParams();
  if (filters?.boardId) params.set("boardId", filters.boardId);
  if (filters?.read !== undefined) params.set("read", String(filters.read));
  if (filters?.type) params.set("type", filters.type);
  if (filters?.search) params.set("search", filters.search);
  params.set("limit", String(filters?.limit ?? 50));
  params.set("offset", String(filters?.offset ?? 0));

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
