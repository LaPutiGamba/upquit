"use client";

import { useMemo, useState } from "react";
import { useFormatter } from "next-intl";
import { Bell, Search, X } from "lucide-react";
import { Link } from "@/localization/i18n/routing";
import { useAuth } from "@/shared/components/AuthProvider";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Input } from "@/shared/components/ui/input";
import { DATE_TIME_FORMAT_OPTIONS } from "@/shared/lib/date";
import type { NotificationFilters } from "@/features/notifications/services/notificationsApi";

const NOTIFICATION_TYPES = [
  { value: "request.created", label: "Request Created" },
  { value: "request.updated", label: "Request Updated" },
  { value: "request.status.changed", label: "Status Changed" },
  { value: "request.comment.created", label: "New Comment" },
  { value: "board.member.added", label: "Member Added" },
  { value: "request.vote.created", label: "New Vote" }
];

export function NotificationsPageContent() {
  const formatter = useFormatter();
  const { boards } = useAuth();
  const [filters, setFilters] = useState<NotificationFilters>({ limit: 50 });
  const { notifications, markAll, markAsRead } = useNotifications(filters);
  const [searchInput, setSearchInput] = useState("");

  const boardNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const board of boards) {
      map.set(board.id, board.name);
    }
    return map;
  }, [boards]);

  const filteredUnread = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const updateFilter = (updates: Partial<NotificationFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates, offset: 0 }));
  };

  const clearFilters = () => {
    setFilters({ limit: 50 });
    setSearchInput("");
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.boardId) count++;
    if (filters.read !== undefined) count++;
    if (filters.type) count++;
    if (searchInput) count++;
    return count;
  }, [filters, searchInput]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6 md:px-6">
      <div className="mb-2 flex items-center gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Bell className="size-6" />
          Notifications
        </h1>
        {activeFilterCount > 0 && (
          <Badge variant="default" className="text-xs">
            {activeFilterCount} active
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Board</label>
                <Select
                  value={filters.boardId ?? "all"}
                  onValueChange={(value) => updateFilter({ boardId: value === "all" ? undefined : value })}
                >
                  <SelectTrigger className="w-full">
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

              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Read status</label>
                <Select
                  value={filters.read === undefined ? "all" : filters.read ? "read" : "unread"}
                  onValueChange={(value) =>
                    updateFilter({ read: value === "all" ? undefined : value === "read" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread only</SelectItem>
                    <SelectItem value="read">Read only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={filters.type ?? "all"}
                  onValueChange={(value) => updateFilter({ type: value === "all" ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {NOTIFICATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
                placeholder="Search notifications..."
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={filteredUnread > 0 ? "default" : "secondary"} className="text-sm">
                {filteredUnread} unread
              </Badge>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 size-3" />
                  Clear filters
                </Button>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void markAll(filters.boardId)}
              disabled={notifications.length === 0 || filteredUnread === 0}
            >
              Mark all as read
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="space-y-2 py-4">
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="mx-auto mb-2 size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {filters.boardId ? "No notifications for this board." : "No notifications yet."}
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const href =
                notification.payload?.url ??
                (notification.payload?.requestId && notification.payload?.boardSlug
                  ? `/board/${notification.payload.boardSlug}/request/${notification.payload.requestId}`
                  : undefined);

              const actor = notification.payload?.actor as
                | {
                    displayName?: string | null;
                    avatarUrl?: string | null;
                    username?: string | null;
                  }
                | undefined;
              const actorDisplayName = actor?.displayName ?? actor?.username ?? "Someone";
              const actorProfileUrl = actor?.username ? `/users/${actor.username}` : null;
              const content = (
                <>
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-base font-semibold">{notification.payload?.title ?? notification.type}</p>
                    {!notification.read && (
                      <Badge variant="default" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground flex items-center gap-2">
                    {actorProfileUrl ? (
                      <Link
                        href={actorProfileUrl}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 hover:underline"
                      >
                        {actor?.avatarUrl ? (
                          <Avatar className="size-6 shrink-0">
                            <AvatarImage src={actor.avatarUrl} alt={actorDisplayName} />
                            <AvatarFallback className="text-[10px] font-semibold">
                              {actorDisplayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar className="size-6 shrink-0">
                            <AvatarFallback className="text-[10px] font-semibold">
                              {actorDisplayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <span className="font-medium text-foreground">{actorDisplayName}</span>
                      </Link>
                    ) : (
                      <span className="font-medium">{actorDisplayName}</span>
                    )}
                    {notification.payload?.body ?? ""}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {notification.boardId && (
                      <p>
                        Board:{" "}
                        <span className="font-medium">
                          {boardNameById.get(notification.boardId) ?? notification.boardId}
                        </span>
                      </p>
                    )}
                    <p>{formatter.dateTime(new Date(notification.createdAt), DATE_TIME_FORMAT_OPTIONS)}</p>
                  </div>
                </>
              );

              return href ? (
                <Link
                  key={notification.id}
                  href={href}
                  onClick={() => void markAsRead(notification.id)}
                  className={`block rounded-lg border p-4 transition-colors ${
                    notification.read ? "bg-background opacity-70" : "border-accent/50 bg-accent/10 hover:bg-accent/20"
                  }`}
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={notification.id}
                  className={`rounded-lg border p-4 transition-colors ${
                    notification.read ? "bg-background opacity-70" : "border-accent/50 bg-accent/10 hover:bg-accent/20"
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
