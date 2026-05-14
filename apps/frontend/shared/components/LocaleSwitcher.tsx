"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/localization/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/shared/components/ui/dropdown-menu";
import { useTransition } from "react";
import { Globe } from "lucide-react";

export function LocaleSwitcher() {
  const { replace } = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (nextLocale: "en" | "es" | "ca") => {
    startTransition(() => {
      localStorage.setItem("upquit-locale", nextLocale);
      const currentSearchParams = window.location.search.replace(/^\?/, "");
      const query = currentSearchParams ? `?${currentSearchParams}` : "";

      replace(`${pathname}${query}`, { locale: nextLocale });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={isPending}>
          <Globe className="size-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => switchLocale("en")} className={locale === "en" ? "bg-accent" : ""}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLocale("es")} className={locale === "es" ? "bg-accent" : ""}>
          Español
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLocale("ca")} className={locale === "ca" ? "bg-accent" : ""}>
          Català
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
