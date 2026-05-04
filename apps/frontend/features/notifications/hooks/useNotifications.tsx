"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/shared/components/AuthProvider";
import { useChannel } from "@/shared/hooks/useChannel";
import { toast } from "@/shared/components/ui/sonner";
import { useRouter } from "@/localization/i18n/routing";
import {
  getNotifications,
  getUnreadCount,
  markAsRead as apiMarkAsRead,
  markAllRead as apiMarkAllRead
} from "../services/notificationsApi";
import type { NotificationItem } from "../services/notificationsApi";

const STICKY_NOTIFICATION_TYPES = new Set(["request.created", "board.member.added", "request.status.changed"]);

export function useNotifications(boardId?: string) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const router = useRouter();

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const list = await getNotifications(boardId);
      setNotifications(list);
      const c = await getUnreadCount(boardId);
      setUnread(c);
    } catch {
      // noop
    }
  }, [userId, boardId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;

    void getNotifications(boardId)
      .then((list) => {
        if (!cancelled) {
          setNotifications(list);
        }
      })
      .catch(() => {
        // noop
      });

    void getUnreadCount(boardId)
      .then((count) => {
        if (!cancelled) {
          setUnread(count);
        }
      })
      .catch(() => {
        // noop
      });

    return () => {
      cancelled = true;
    };
  }, [userId, boardId]);

  useChannel<{ title?: string; body?: string } | { type?: string; payload?: { title?: string; body?: string } }>(
    userId ? `notification.${userId}` : null,
    (msg) => {
      const payload = msg.payload;

      let title = "New notification";
      let body = "You have a new update.";
      let typeVal = "";

      if (payload && typeof payload === "object" && "payload" in payload) {
        title = payload.payload?.title ?? title;
        body = payload.payload?.body ?? body;
        typeVal = payload.type ?? "";
      } else if (payload && typeof payload === "object") {
        const direct = payload as { title?: string; body?: string };
        title = direct.title ?? title;
        body = direct.body ?? body;
      }

      const isSticky = STICKY_NOTIFICATION_TYPES.has(typeVal);

      // clickable toast when payload contains a url
      const rawPayload = payload as Record<string, unknown>;
      const nestedUrl =
        typeof (rawPayload?.payload as Record<string, unknown>)?.url === "string"
          ? (rawPayload?.payload as Record<string, unknown>)?.url
          : undefined;
      const directUrl = typeof rawPayload?.url === "string" ? rawPayload.url : undefined;
      const url = (nestedUrl ?? directUrl) as string | undefined;

      toast.info(title, {
        description: body,
        duration: isSticky ? Infinity : 4000,
        action: url
          ? {
              label: "Open",
              onClick: () => {
                try {
                  router.push(url);
                } catch {
                  // noop
                }
              }
            }
          : undefined
      });

      void (async () => {
        await load();
      })();
    }
  );

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

  return { notifications, unread, reload: load, markAsRead, markAll };
}
