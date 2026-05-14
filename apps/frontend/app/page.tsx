"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { routing } from "@/localization/i18n/routing";

const SUPPORTED_LOCALES = routing.locales;
const DEFAULT_LOCALE = routing.defaultLocale;
const LOCALE_STORAGE_KEY = "upquit-locale";

function getSavedLocale(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LOCALE_STORAGE_KEY);
}

function getBrowserLocale(): string {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const browserLang = navigator.language.split("-")[0];
  if (SUPPORTED_LOCALES.includes(browserLang as typeof routing.locales[number])) {
    return browserLang;
  }
  return DEFAULT_LOCALE;
}

function getTargetLocale(): string {
  const saved = getSavedLocale();
  if (saved && SUPPORTED_LOCALES.includes(saved as typeof routing.locales[number])) {
    return saved;
  }
  return getBrowserLocale();
}

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const targetLocale = getTargetLocale();
    router.replace(`/${targetLocale}`);
  }, [router]);

  return null;
}