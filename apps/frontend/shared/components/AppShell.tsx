"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { LayoutGrid, Sparkles } from "lucide-react";

import { usePathname, useRouter } from "@/localization/i18n/routing";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
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
import { boardService, type BoardResponse } from "@/features/boards/services/boardService";
import { CreateBoardForm } from "@/features/boards/components/CreateBoardForm";
import { toast } from "@/shared/components/ui/sonner";
import { authService, type UserResponse } from "@/features/authentication/services/authService";
import { decodeJwtPayload } from "@/shared/lib/jwt";
import { getAccessToken } from "@/shared/lib/apiClient";
import { BoardSwitcher } from "@/shared/components/app-shell/BoardSwitcher";
import { NavMain } from "@/shared/components/app-shell/NavMain";
import { NavUser } from "@/shared/components/app-shell/NavUser";
import { getInitials } from "@/shared/components/app-shell/utils";
import type { SidebarItem } from "@/shared/components/app-shell/types";

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
  const tBoards = useTranslations("BoardsEntryGate");

  const [user, setUser] = useState<UserResponse | null>(null);
  const [boards, setBoards] = useState<BoardResponse[]>([]);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsDisplayName, setSettingsDisplayName] = useState("");
  const [settingsAvatarUrl, setSettingsAvatarUrl] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const shouldHideShell = isAuthPath(pathname) || isShelllessPath(pathname);

  useEffect(() => {
    if (shouldHideShell) {
      return;
    }

    let isCancelled = false;

    const loadShellData = async () => {
      let token = getAccessToken();

      if (!token) {
        try {
          const refreshed = await authService.refreshSession();
          token = refreshed.accessToken;
        } catch {
          token = null;
        }
      }

      if (!token) {
        return;
      }

      const payload = decodeJwtPayload<{ userId?: string; sub?: string }>(token);
      const userId = payload?.userId ?? payload?.sub;

      if (!userId) {
        return;
      }

      try {
        const [profile, userBoards] = await Promise.all([
          authService.getUserProfile(userId, token),
          boardService.getMyBoards(token)
        ]);

        if (!isCancelled) {
          setUser(profile);
          setBoards(userBoards);
          setSettingsDisplayName(profile.displayName);
          setSettingsAvatarUrl(profile.avatarUrl ?? "");
        }
      } catch {
        if (!isCancelled) {
          setUser(null);
          setBoards([]);
        }
      }
    };

    void loadShellData();

    return () => {
      isCancelled = true;
    };
  }, [shouldHideShell]);

  const currentBoardSlug = pathname.startsWith("/board/") ? pathname.replace("/board/", "").split("/")[0] : null;
  const activeBoard = boards.find((board) => board.slug === currentBoardSlug) ?? null;
  const isRequestsTab = searchParams.get("tab") === "requests";
  const isUserBoardsDashboard = pathname === "/boards";

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

  const handleOpenSettings = () => {
    setSettingsDisplayName(user?.displayName ?? "");
    setSettingsAvatarUrl(user?.avatarUrl ?? "");
    setIsSettingsOpen(true);
  };

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

  const handleSaveSettings = async () => {
    if (!user) {
      return;
    }

    const nextDisplayName = settingsDisplayName.trim();
    if (nextDisplayName.length < 2) {
      toast.error(t("settings.validation.displayName"));
      return;
    }

    setIsSavingSettings(true);

    try {
      const updatedUser = await authService.updateUser(user.id, {
        displayName: nextDisplayName,
        avatarUrl: settingsAvatarUrl.trim() || null
      });

      setUser(updatedUser);
      setIsSettingsOpen(false);
      toast.success(t("settings.saved"));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t("settings.failed"));
      }
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (shouldHideShell) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border/70">
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

        <SidebarContent className="px-2 group-data-[collapsible=icon]/sidebar-wrapper:px-1">
          <NavMain
            sectionLabel={t("section")}
            items={sidebarItems}
            activeBoard={activeBoard}
            isRequestsTab={isRequestsTab}
            pathname={pathname}
          />
        </SidebarContent>

        <SidebarFooter className="px-2 pb-3 group-data-[collapsible=icon]/sidebar-wrapper:px-1">
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

      <Dialog open={isCreateBoardOpen} onOpenChange={setIsCreateBoardOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{tBoards("dialogTitle")}</DialogTitle>
            <DialogDescription>{tBoards("dialogDescription")}</DialogDescription>
          </DialogHeader>
          <CreateBoardForm
            onSuccess={async (createdBoardSlug) => {
              setIsCreateBoardOpen(false);

              try {
                const updatedBoards = await boardService.getMyBoards();
                setBoards(updatedBoards);
              } catch {
                // Keep current boards list if refresh fails.
              }

              router.push(`/board/${createdBoardSlug}`);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("settings.title")}</DialogTitle>
            <DialogDescription>{t("settings.description")}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>{t("settings.fields.displayName")}</FieldLabel>
              <Input value={settingsDisplayName} onChange={(event) => setSettingsDisplayName(event.target.value)} />
            </Field>
            <Field>
              <FieldLabel>{t("settings.fields.avatarUrl")}</FieldLabel>
              <Input
                value={settingsAvatarUrl}
                onChange={(event) => setSettingsAvatarUrl(event.target.value)}
                placeholder="https://"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsSettingsOpen(false)} disabled={isSavingSettings}>
                {t("settings.actions.cancel")}
              </Button>
              <Button onClick={() => void handleSaveSettings()} disabled={isSavingSettings}>
                {isSavingSettings ? t("settings.actions.saving") : t("settings.actions.save")}
              </Button>
            </div>
          </FieldGroup>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
