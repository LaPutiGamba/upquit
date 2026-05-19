"use client";

import {
  ChevronsUpDown,
  LayoutGrid,
  LogOut,
  Settings2,
  Globe,
  Moon,
  Sun
} from "lucide-react";
import { Link } from "@/localization/i18n/routing";
import { useRouter, usePathname } from "@/localization/i18n/routing";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useTransition } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuTrigger
} from "@/shared/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";

interface UserDropdownMenuProps {
  displayName: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
  dashboardLabel: string;
  dashboardHref: string;
  showDashboardAction: boolean;
  settingsLabel: string;
  logOutLabel: string;
  variant: "sidebar" | "header";
  onOpenSettings: () => void;
  onLogOut: () => Promise<void>;
}

export function UserDropdownMenu({
  displayName,
  email,
  initials,
  avatarUrl,
  dashboardLabel,
  dashboardHref,
  showDashboardAction,
  settingsLabel,
  logOutLabel,
  variant,
  onOpenSettings,
  onLogOut
}: UserDropdownMenuProps) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (nextLocale: "en" | "es" | "ca") => {
    startTransition(() => {
      localStorage.setItem("upquit-locale", nextLocale);
      const currentSearchParams = window.location.search.replace(/^\?/, "");
      const query = currentSearchParams ? `?${currentSearchParams}` : "";

      replace(`${pathname}${query}`, { locale: nextLocale });
    });
  };

  if (variant === "header") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="size-8">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 min-w-56" side="bottom" align="center" sideOffset={4}>
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
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Globe className="size-4" />
              <span>Language</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => switchLocale("en")}
                  className={locale === "en" ? "bg-accent" : ""}
                  disabled={isPending}
                >
                  <Globe className="size-4" />
                  <span>English</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => switchLocale("es")}
                  className={locale === "es" ? "bg-accent" : ""}
                  disabled={isPending}
                >
                  <Globe className="size-4" />
                  <span>Español</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => switchLocale("ca")}
                  className={locale === "ca" ? "bg-accent" : ""}
                  disabled={isPending}
                >
                  <Globe className="size-4" />
                  <span>Català</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="size-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="size-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Globe className="size-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
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
    );
  }

  // Sidebar variant (original NavUser behavior)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          className="w-full h-auto px-2 py-2 justify-start data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]/sidebar-wrapper:px-0"
        >
          <Avatar className="size-8 rounded-lg">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]/sidebar-wrapper:hidden">
            <span className="truncate font-medium">{displayName}</span>
            <span className="truncate text-xs text-sidebar-foreground/70">{email}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]/sidebar-wrapper:hidden" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 min-w-56" side="top" align="center" sideOffset={4}>
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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Globe className="size-4" />
            <span>Language</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => switchLocale("en")}
                className={locale === "en" ? "bg-accent" : ""}
                disabled={isPending}
              >
                <Globe className="size-4" />
                <span>English</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => switchLocale("es")}
                className={locale === "es" ? "bg-accent" : ""}
                disabled={isPending}
              >
                <Globe className="size-4" />
                <span>Español</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => switchLocale("ca")}
                className={locale === "ca" ? "bg-accent" : ""}
                disabled={isPending}
              >
                <Globe className="size-4" />
                <span>Català</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="size-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="size-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Globe className="size-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
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
  );
}
