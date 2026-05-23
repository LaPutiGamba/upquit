"use client";

import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/shared/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/components/ui/tooltip";
import NotificationDropdown from "./NotificationDropdown";
import { useNotifications } from "../hooks/useNotifications";
import { usePathname } from "@/localization/i18n/routing";
import { useAuth } from "@/shared/components/AuthProvider";

export default function NotificationBell() {
  const pathname = usePathname();
  const { boards } = useAuth();
  const currentBoardSlug = pathname.startsWith("/board/") ? pathname.replace("/board/", "").split("/")[0] : null;
  const currentBoard = boards.find((board) => board.slug === currentBoardSlug);
  const currentBoardId = currentBoard?.id;
  const { notifications, unread, markAsRead, markAll } = useNotifications(
    currentBoardId ? { boardId: currentBoardId } : undefined
  );

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative">
              <Bell />
              {unread > 0 ? (
                <span className="absolute -top-1 -right-1">
                  <Badge>{unread}</Badge>
                </span>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>{unread > 0 ? `${unread} notifications` : "Notifications"}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-130 p-0">
        <NotificationDropdown
          notifications={notifications}
          onMarkRead={async (id) => {
            await markAsRead(id);
          }}
          onMarkAll={async () => {
            await markAll(currentBoardId);
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
