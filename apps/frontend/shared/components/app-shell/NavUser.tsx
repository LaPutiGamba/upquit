import { ChevronsUpDown, LayoutGrid, LogOut, Settings2 } from "lucide-react";
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

interface NavUserProps {
  displayName: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
  dashboardLabel: string;
  dashboardHref: string;
  showDashboardAction: boolean;
  settingsLabel: string;
  logOutLabel: string;
  onOpenSettings: () => void;
  onLogOut: () => Promise<void>;
}

export function NavUser({
  displayName,
  email,
  initials,
  avatarUrl,
  dashboardLabel,
  dashboardHref,
  showDashboardAction,
  settingsLabel,
  logOutLabel,
  onOpenSettings,
  onLogOut
}: NavUserProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]/sidebar-wrapper:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 min-w-56" side="right" align="end" sideOffset={4}>
            <DropdownMenuLabel>
              <div className="grid gap-0.5">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">{email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {showDashboardAction ? (
              <>
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref}>
                    <LayoutGrid className="size-4" />
                    <span>{dashboardLabel}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            ) : null}
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                onOpenSettings();
              }}
            >
              <Settings2 className="size-4" />
              <span>{settingsLabel}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={(event) => {
                event.preventDefault();
                void onLogOut();
              }}
            >
              <LogOut className="size-4" />
              <span>{logOutLabel}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
