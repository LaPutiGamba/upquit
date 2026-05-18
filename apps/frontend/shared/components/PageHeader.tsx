"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/localization/i18n/routing";
import { useAuth } from "@/shared/components/AuthProvider";
import { Button } from "@/shared/components/ui/button";
import NotificationBell from "@/features/notifications/components/NotificationBell";
import { UserDropdownMenu } from "@/shared/components/UserDropdownMenu";
import { getInitials } from "@/shared/components/app-shell/utils";
import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { authService } from "@/features/authentication/services/authService";
import { toast } from "@/shared/components/ui/sonner";
import { UserSettingsModal } from "@/shared/components/app-shell/UserSettingsModal";

interface PageHeaderProps {
  showBackButton?: boolean;
}

const emptySubscribe = () => () => {};

export function PageHeader({ showBackButton = true }: PageHeaderProps) {
  const router = useRouter();
  const { replace, refresh } = router;
  const { user } = useAuth();
  const t = useTranslations("AppShell");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const userDisplayName = isHydrated ? user?.displayName || t("user.name") : t("user.name");
  const userEmail = isHydrated ? user?.email || t("user.role") : t("user.role");
  const userInitials = getInitials(userDisplayName);

  const handleOpenSettings = () => setIsSettingsOpen(true);

  const handleLogout = async () => {
    try {
      await authService.logout();
      replace("/login");
      refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t("actions.logoutFailed"));
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border/65 bg-background/84 px-4 backdrop-blur-md">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2">
            <ArrowLeft className="size-5" />
          </Button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <NotificationBell />
          <UserDropdownMenu
            displayName={userDisplayName}
            email={userEmail}
            initials={userInitials}
            avatarUrl={isHydrated ? (user?.avatarUrl ?? null) : null}
            dashboardLabel={t("actions.dashboard")}
            dashboardHref="/boards"
            showDashboardAction={true}
            settingsLabel={t("actions.settings")}
            logOutLabel={t("actions.logOut")}
            variant="header"
            onOpenSettings={handleOpenSettings}
            onLogOut={handleLogout}
          />
        </div>
      </header>
      <UserSettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
