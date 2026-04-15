import type { BoardResponse } from "@/features/boards/services/boardService";
import { Link } from "@/localization/i18n/routing";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/shared/components/ui/sidebar";
import type { SidebarItem } from "@/shared/components/app-shell/types";

interface NavMainProps {
  sectionLabel: string;
  items: SidebarItem[];
  activeBoard: BoardResponse | null;
  isRequestsTab: boolean;
  pathname: string;
}

export function NavMain({ sectionLabel, items, activeBoard, isRequestsTab, pathname }: NavMainProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{sectionLabel}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.id === "dashboard"
                ? activeBoard
                  ? pathname === `/board/${activeBoard.slug}` && !isRequestsTab
                  : pathname === "/boards"
                : activeBoard
                  ? pathname === `/board/${activeBoard.slug}` && isRequestsTab
                  : false;

            return (
              <SidebarMenuItem key={`${item.id}-${item.label}`}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className="group-data-[collapsible=icon]/sidebar-wrapper:justify-center"
                >
                  <Link href={item.href}>
                    <Icon data-icon="inline-start" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
