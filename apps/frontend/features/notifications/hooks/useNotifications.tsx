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

const STICKY_NOTIFICATION_TYPES = new Set([
  "request.created",
  "request.updated",
  "board.member.added",
  "request.status.changed"
]);

interface NotificationPayload {
  title?: string;
  body?: string;
  actor?: {
    displayName?: string | null;
    avatarUrl?: string | null;
    username?: string | null;
  };
}

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
    } catch {}
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
      .catch(() => {});

    void getUnreadCount(boardId)
      .then((count) => {
        if (!cancelled) {
          setUnread(count);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [userId, boardId]);

  useChannel(userId ? `notification.${userId}` : null, (msg) => {
    const payload = msg.payload as Record<string, unknown>;

    let body = "You have a new update.";
    let typeVal = "";
    let actorDisplayName: string | null = null;

    if (payload && typeof payload === "object" && "payload" in payload) {
      const nestedPayload = payload.payload as NotificationPayload | undefined;
      body = nestedPayload?.body ?? body;
      actorDisplayName = nestedPayload?.actor?.displayName ?? nestedPayload?.actor?.username ?? null;
      typeVal = (payload.type as string) ?? "";
    } else if (payload && typeof payload === "object") {
      const direct = payload as NotificationPayload;
      body = direct.body ?? body;
      actorDisplayName = direct.actor?.displayName ?? direct.actor?.username ?? null;
    }

    const isSticky = STICKY_NOTIFICATION_TYPES.has(typeVal);

    const personalizedMessage = actorDisplayName ? `${actorDisplayName} ${body}` : body;

    const nestedUrl =
      typeof (payload.payload as Record<string, unknown>)?.url === "string"
        ? (payload.payload as Record<string, unknown>)?.url
        : undefined;
    const directUrl = typeof payload.url === "string" ? payload.url : undefined;
    const url = (nestedUrl ?? directUrl) as string | undefined;

    toast.info(personalizedMessage, {
      duration: isSticky ? Infinity : 4000,
      action: url
        ? {
            label: "Open",
            onClick: () => {
              try {
                router.push(url);
              } catch {}
            }
          }
        : undefined
    });

    void (async () => {
      await load();
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

  return { notifications, unread, reload: load, markAsRead, markAll };
}
