import { BookOpenCheck, ChevronsUpDown, Plus } from "lucide-react";

import { Link } from "@/localization/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/shared/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/shared/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import type { BoardResponse } from "@/features/boards/services/boardService";
import { getBoardFallbackLetter } from "@/shared/components/app-shell/utils";

interface BoardSwitcherProps {
  activeBoard: BoardResponse | null;
  boards: BoardResponse[];
  workspaceLabel: string;
  createBoardShortcutLabel: string;
  boardsTitle: string;
  emptyBoardsLabel: string;
  createBoardLabel: string;
  onCreateBoard: () => void;
}

export function BoardSwitcher({
  activeBoard,
  boards,
  workspaceLabel,
  createBoardShortcutLabel,
  boardsTitle,
  emptyBoardsLabel,
  createBoardLabel,
  onCreateBoard
}: BoardSwitcherProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <Avatar className="h-8 w-8 rounded-lg border">
                {activeBoard?.logoUrl ? <AvatarImage src={activeBoard.logoUrl} alt={activeBoard.name} /> : null}
                <AvatarFallback className="rounded-lg text-xs font-semibold">
                  {getBoardFallbackLetter(activeBoard?.name ?? workspaceLabel)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                <span className="truncate font-semibold">{activeBoard?.name ?? workspaceLabel}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">{createBoardShortcutLabel}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]/sidebar-wrapper:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 min-w-64" side="right" align="start" sideOffset={4}>
            <DropdownMenuLabel>{boardsTitle}</DropdownMenuLabel>
            {boards.length > 0 ? (
              boards.map((board) => (
                <DropdownMenuItem key={board.id} asChild>
                  <Link href={`/board/${board.slug}`}>
                    <BookOpenCheck className="size-4" />
                    <span>{board.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>{emptyBoardsLabel}</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                onCreateBoard();
              }}
            >
              <Plus className="size-4" />
              <span>{createBoardLabel}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
