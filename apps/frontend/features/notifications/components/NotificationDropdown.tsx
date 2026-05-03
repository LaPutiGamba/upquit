"use client";

import React from "react";
import { DropdownMenuSeparator } from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@/localization/i18n/routing";
import { CheckCheck, Check } from "lucide-react";
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
          notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-2 px-3 py-3 hover:bg-accent/50 border-b last:border-b-0 transition-colors ${n.read ? "opacity-60" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{n.payload?.title ?? n.type}</div>
                <div className="text-xs text-muted-foreground break-words">{n.payload?.body}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                {!n.read && (
                  <Badge variant="default" className="text-xs">
                    New
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onMarkRead && onMarkRead(n.id)}
                  className="h-6 w-6 p-0"
                  title={n.read ? "Already read" : "Mark as read"}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
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
