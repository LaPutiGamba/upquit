"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import { authService } from "@/features/authentication/services/authService";
import { Button } from "@/shared/components/ui/button";
import { toast } from "@/shared/components/ui/sonner";

type LogoutButtonProps = React.ComponentProps<typeof Button>;

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export function LogoutButton({ children, ...props }: LogoutButtonProps) {
  const t = useTranslations("LogoutButton");
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, t("errors.generic")));
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button onClick={handleLogout} disabled={isLoggingOut} {...props}>
      <LogOut />
      {children ?? (isLoggingOut ? t("actions.loggingOut") : t("actions.logout"))}
    </Button>
  );
}
