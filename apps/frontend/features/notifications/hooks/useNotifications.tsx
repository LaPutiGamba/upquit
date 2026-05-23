"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/components/AuthProvider";
import { useChannel } from "@/shared/hooks/useChannel";
import { toast } from "@/shared/components/ui/sonner";
import {
  getNotifications,
  getUnreadCount,
  markAsRead as apiMarkAsRead,
  markAllRead as apiMarkAllRead,
  type NotificationFilters
} from "../services/notificationsApi";
import type { NotificationItem } from "../services/notificationsApi";

const STICKY_NOTIFICATION_TYPES = new Set([
  "request.created",
  "request.updated",
  "board.member.added",
  "request.status.changed"
]);

export function useNotifications(filters?: NotificationFilters) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;

    void getNotifications(filters)
      .then((list) => {
        if (!cancelled) {
          setNotifications(list);
        }
      })
      .catch(() => {});

    void getUnreadCount(filters?.boardId)
      .then((count) => {
        if (!cancelled) {
          setUnread(count);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [userId, filters]);

  const reload = useCallback(async () => {
    if (!userId) return;
    try {
      const list = await getNotifications(filters);
      setNotifications(list);
      const c = await getUnreadCount(filters?.boardId);
      setUnread(c);
    } catch {}
  }, [userId, filters]);

  useChannel(userId ? `notification.${userId}` : null, (msg) => {
    const wrapper = msg.payload as { data?: NotificationItem; timestamp?: string };
    const notification = wrapper?.data;

    if (!notification || typeof notification !== "object") {
      return;
    }

    const payload = (notification.payload as Record<string, unknown>) ?? {};

    const body = (payload.body as string) ?? "You have a new update.";
    const title = (payload.title as string) ?? notification.type ?? "";
    const actor = (payload.actor as {
      displayName?: string | null;
      username?: string | null;
      avatarUrl?: string | null;
    })
      ? (payload.actor as { displayName?: string | null; username?: string | null })
      : undefined;
    const actorDisplayName = actor?.displayName ?? actor?.username ?? null;
    const typeVal = notification.type ?? "";

    const isSticky = STICKY_NOTIFICATION_TYPES.has(typeVal);

    const toastTitle = title || notification.type || "New notification";
    const toastDescription = actorDisplayName ? `${actorDisplayName} ${body}` : body;

    toast.info(toastTitle, {
      description: toastDescription,
      duration: isSticky ? Infinity : 4000
    });

    void (async () => {
      await reload();
    })();
  });

  const markAsRead = useCallback(async (id: string) => {
    await apiMarkAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  }, []);

  const markAll = useCallback(async (boardId?: string) => {
    await apiMarkAllRead(boardId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }, []);

  return { notifications, unread, reload, markAsRead, markAll };
}
