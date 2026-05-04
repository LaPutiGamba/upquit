"use client";

import { DropdownMenuItem, DropdownMenuSeparator } from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@/localization/i18n/routing";
import { CheckCheck } from "lucide-react";
import type { NotificationItem } from "../services/notificationsApi";

export default function NotificationDropdown({
  notifications = [],
  onMarkRead,
  onMarkAll
}: {
  notifications?: NotificationItem[];
  onMarkRead?: (id: string) => void;
  onMarkAll?: () => void;
}) {
  return (
    <div className="w-full">
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Notifications</h4>
          <Button variant="ghost" size="sm" onClick={onMarkAll} className="h-6 w-6 p-0" title="Mark all as read">
            <CheckCheck className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <DropdownMenuSeparator />
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground text-center">No notifications</div>
        ) : (
          notifications.map((n) => {
            const href =
              n.payload?.url ??
              (n.payload?.requestId && n.payload?.boardSlug
                ? `/board/${n.payload.boardSlug}/request/${n.payload.requestId}`
                : undefined);

            return href ? (
              <DropdownMenuItem key={n.id} asChild className="h-auto w-full rounded-none p-0">
                <Link
                  href={href}
                  className={`flex w-full items-start gap-3 border-b border-border/60 px-3 py-3 text-left transition-colors hover:bg-accent/50 ${
                    n.read ? "opacity-60" : ""
                  }`}
                  onClick={() => onMarkRead?.(n.id)}
                >
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/40 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-current" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-medium">{n.payload?.title ?? n.type}</div>
                      {!n.read && (
                        <Badge variant="default" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs leading-relaxed text-muted-foreground">{n.payload?.body}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true
                      })}
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            ) : (
              <div
                key={n.id}
                className={`flex items-start gap-3 border-b border-border/60 px-3 py-3 transition-colors ${
                  n.read ? "opacity-60" : "hover:bg-accent/50"
                }`}
              >
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/40 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-current" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-medium">{n.payload?.title ?? n.type}</div>
                    {!n.read && (
                      <Badge variant="default" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs leading-relaxed text-muted-foreground">{n.payload?.body}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <DropdownMenuSeparator />
      <div className="px-3 py-2">
        <Link href="/notifications" className="text-sm text-primary hover:underline">
          See all notifications →
        </Link>
      </div>
    </div>
  );
}
