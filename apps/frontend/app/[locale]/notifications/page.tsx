"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/localization/i18n/routing";
import { Bell, ArrowLeft } from "lucide-react";
import { Link } from "@/localization/i18n/routing";
import { useAuth } from "@/shared/components/AuthProvider";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

export default function NotificationsPage() {
  const router = useRouter();
  const { boards } = useAuth();
  const { notifications, markAll, markAsRead } = useNotifications(undefined);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  const boardNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const board of boards) {
      map.set(board.id, board.name);
    }
    return map;
  }, [boards]);

  const filteredNotifications = useMemo(() => {
    if (!selectedBoardId) return notifications;
    return notifications.filter((n) => n.boardId === selectedBoardId);
  }, [notifications, selectedBoardId]);

  const filteredUnread = useMemo(() => {
    return filteredNotifications.filter((n) => !n.read).length;
  }, [filteredNotifications]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6 md:px-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-2">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="h-9 w-9" title="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="size-6" />
            Notifications
          </h1>
        </div>
      </div>

      {/* Filter and Actions */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Select
                value={selectedBoardId ?? "all"}
                onValueChange={(value) => setSelectedBoardId(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All boards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All boards</SelectItem>
                  {boards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={filteredUnread > 0 ? "default" : "secondary"} className="text-sm">
                {filteredUnread} unread
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void markAll()}
                disabled={filteredNotifications.length === 0 || filteredUnread === 0}
              >
                Mark all as read
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent className="space-y-2 py-4">
          {filteredNotifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                {selectedBoardId ? "No notifications for this board." : "No notifications yet."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const href =
                notification.payload?.url ??
                (notification.payload?.requestId && notification.payload?.boardSlug
                  ? `/board/${notification.payload.boardSlug}/request/${notification.payload.requestId}`
                  : undefined);

              const content = (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-base">{notification.payload?.title ?? notification.type}</p>
                    {!notification.read && (
                      <Badge variant="default" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notification.payload?.body ?? ""}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {notification.boardId && (
                      <p>
                        Board:{" "}
                        <span className="font-medium">
                          {boardNameById.get(notification.boardId) ?? notification.boardId}
                        </span>
                      </p>
                    )}
                    <p>{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                </>
              );

              return href ? (
                <Link
                  key={notification.id}
                  href={href}
                  onClick={() => void markAsRead(notification.id)}
                  className={`block rounded-lg border p-4 transition-colors ${
                    notification.read ? "bg-background opacity-70" : "bg-accent/10 border-accent/50 hover:bg-accent/20"
                  }`}
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={notification.id}
                  className={`rounded-lg border p-4 transition-colors ${
                    notification.read ? "bg-background opacity-70" : "bg-accent/10 border-accent/50 hover:bg-accent/20"
                  }`}
                >
                  {content}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </main>
  );
}
