"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { LayoutGrid, Sparkles } from "lucide-react";

import { usePathname, useRouter } from "@/localization/i18n/routing";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger
} from "@/shared/components/ui/sidebar";
import { toast } from "@/shared/components/ui/sonner";
import { authService } from "@/features/authentication/services/authService";
import { BoardSwitcher } from "@/shared/components/app-shell/BoardSwitcher";
import { NavMain } from "@/shared/components/app-shell/NavMain";
import { NavUser } from "@/shared/components/app-shell/NavUser";
import { getInitials } from "@/shared/components/app-shell/utils";
import type { SidebarItem } from "@/shared/components/app-shell/types";
import { useAuth } from "@/shared/components/AuthProvider";
import { CreateBoardModal } from "@/shared/components/app-shell/CreateBoardModal";
import { UserSettingsModal } from "@/shared/components/app-shell/UserSettingsModal";

interface AppShellProps {
  children: React.ReactNode;
}

const AUTH_PATHS = ["/login", "/register", "/verify", "/verify-email"];
const SHELLLESS_PATHS = ["/"];

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isShelllessPath(pathname: string): boolean {
  return SHELLLESS_PATHS.includes(pathname);
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("AppShell");
  const { user, boards } = useAuth();

  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const shouldHideShell = isAuthPath(pathname) || isShelllessPath(pathname);

  const currentBoardSlug = pathname.startsWith("/board/") ? pathname.replace("/board/", "").split("/")[0] : null;
  const activeBoard = boards.find((board) => board.slug === currentBoardSlug) ?? null;
  const isRequestsTab = searchParams.get("tab") === "requests";
  const isUserBoardsDashboard = pathname === "/boards";
  const shouldShowBoardNavigation = !isUserBoardsDashboard;

  const boardDashboardHref = activeBoard ? `/board/${activeBoard.slug}` : "/boards";
  const boardRequestsHref = activeBoard ? `/board/${activeBoard.slug}?tab=requests` : "/boards";

  const sidebarItems = useMemo<SidebarItem[]>(
    () => [
      {
        id: "dashboard",
        href: boardDashboardHref,
        label: t("navigation.dashboard"),
        icon: LayoutGrid
      },
      {
        id: "requests",
        href: boardRequestsHref,
        label: t("navigation.requests"),
        icon: Sparkles
      }
    ],
    [boardDashboardHref, boardRequestsHref, t]
  );

  const userDisplayName = user?.displayName || t("user.name");
  const userRole = user?.email || t("user.role");
  const userInitials = getInitials(userDisplayName);

  const handleOpenSettings = () => setIsSettingsOpen(true);

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t("actions.logoutFailed"));
      }
    }
  };

  if (shouldHideShell) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border/70">
        {shouldShowBoardNavigation ? (
          <SidebarHeader className="px-2 py-3 group-data-[collapsible=icon]/sidebar-wrapper:px-1">
            <BoardSwitcher
              activeBoard={activeBoard}
              boards={boards}
              workspaceLabel={t("workspace")}
              createBoardShortcutLabel={t("actions.createBoardShortcut")}
              boardsTitle={t("boards.title")}
              emptyBoardsLabel={t("boards.empty")}
              createBoardLabel={t("actions.createBoard")}
              onCreateBoard={() => setIsCreateBoardOpen(true)}
            />
          </SidebarHeader>
        ) : null}

        {shouldShowBoardNavigation ? (
          <SidebarContent className="px-2 group-data-[collapsible=icon]/sidebar-wrapper:px-1">
            <NavMain
              sectionLabel={t("section")}
              items={sidebarItems}
              activeBoard={activeBoard}
              isRequestsTab={isRequestsTab}
              pathname={pathname}
            />
          </SidebarContent>
        ) : null}

        <SidebarFooter className="mt-auto px-2 pb-3 group-data-[collapsible=icon]/sidebar-wrapper:px-1">
          <NavUser
            displayName={userDisplayName}
            email={userRole}
            initials={userInitials}
            avatarUrl={user?.avatarUrl ?? null}
            dashboardLabel={t("actions.dashboard")}
            dashboardHref="/boards"
            showDashboardAction={!isUserBoardsDashboard}
            settingsLabel={t("actions.settings")}
            logOutLabel={t("actions.logOut")}
            onOpenSettings={handleOpenSettings}
            onLogOut={handleLogout}
          />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="bg-background">
        <div className="flex min-h-svh flex-col">
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border/65 bg-background/84 px-4 backdrop-blur-md">
            <SidebarTrigger className="-ml-1" />
            <p className="text-sm font-semibold tracking-tight md:hidden">UpQuit</p>
          </header>
          <div className="flex-1">{children}</div>
        </div>
      </SidebarInset>

      <CreateBoardModal open={isCreateBoardOpen} onOpenChange={setIsCreateBoardOpen} />
      <UserSettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </SidebarProvider>
  );
}
