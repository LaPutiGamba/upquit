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
  currentBoardSlug: string | null;
  isRequestsTab: boolean;
  pathname: string;
}

export function NavMain({ sectionLabel, items, activeBoard, currentBoardSlug, isRequestsTab, pathname }: NavMainProps) {
  const selectedBoardSlug = activeBoard?.slug ?? currentBoardSlug;

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:p-0">
      <SidebarGroupLabel>{sectionLabel}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.id === "dashboard"
                ? selectedBoardSlug
                  ? pathname === `/board/${selectedBoardSlug}` && !isRequestsTab
                  : pathname === "/boards"
                : selectedBoardSlug
                  ? pathname === `/board/${selectedBoardSlug}` && isRequestsTab
                  : false;

            return (
              <SidebarMenuItem key={`${item.id}-${item.label}`}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className="group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0"
                >
                  <Link href={item.href} className="group-data-[collapsible=icon]:justify-center">
                    <Icon data-icon="inline-start" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
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
