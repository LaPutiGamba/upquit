import { SidebarMenu, SidebarMenuItem } from "@/shared/components/ui/sidebar";
import { UserDropdownMenu } from "@/shared/components/UserDropdownMenu";

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
        <UserDropdownMenu
          displayName={displayName}
          email={email}
          initials={initials}
          avatarUrl={avatarUrl}
          dashboardLabel={dashboardLabel}
          dashboardHref={dashboardHref}
          showDashboardAction={showDashboardAction}
          settingsLabel={settingsLabel}
          logOutLabel={logOutLabel}
          variant="sidebar"
          onOpenSettings={onOpenSettings}
          onLogOut={onLogOut}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
