import type { DateTimeFormatOptions } from "next-intl";

export const DATE_TIME_FORMAT_OPTIONS: DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
};

export const REQUEST_DATE_FORMAT_OPTIONS: DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric"
};

export const REQUEST_HISTORY_OPTIONS_BASE: DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
};

export const MONTH_YEAR_FORMAT_OPTIONS: DateTimeFormatOptions = {
  year: "numeric",
  month: "long"
};

// Cache Intl.DateTimeFormat instances by locale+options to avoid
// allocating a new formatter on every call (performance).
const FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

function getDateTimeFormatter(locale: string | undefined, options: DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale ?? "default"}::${JSON.stringify(options)}`;
  let formatter = FORMATTER_CACHE.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    FORMATTER_CACHE.set(key, formatter);
  }

  return formatter;
}

/**
 * Format date for display. This version should ONLY be used in Server Components
 * or to format data that will be passed to Client Components.
 * Client Components should use formatDateWithFormatter() with next-intl instead.
 *
 * @deprecated Use formatDateWithFormatter() in Client Components
 * @param date - Date to format
 * @param locale - Locale string (e.g., "en-US")
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatRequestDateServer(date: string | Date, locale?: string): string {
  // kept for compatibility — forwards to client helpers are preferred
  const s = getDateTimeFormatter(locale, REQUEST_DATE_FORMAT_OPTIONS).format(new Date(date));
  if (locale && (locale.startsWith("es") || locale.startsWith("ca"))) {
    const lastIdx = s.lastIndexOf(" de ");
    if (lastIdx === -1) return s;
    return s.slice(0, lastIdx) + ", " + s.slice(lastIdx + 4);
  }
  return s;
}

function needsSpanishCatalanCommaFix(locale?: string) {
  if (!locale) return false;
  return locale.startsWith("es") || locale.startsWith("ca");
}
function replaceLastDeWithComma(input: string) {
  // Replace the last occurrence of " de " with ", " to match UX requirement
  const lastIdx = input.lastIndexOf(" de ");
  if (lastIdx === -1) return input;
  return input.slice(0, lastIdx) + ", " + input.slice(lastIdx + 4);
}

/**
 * Safe date formatting using next-intl Formatter.
 * This prevents hydration mismatches by using the same formatter on server and client.
 * ONLY use this in Client Components with "use client" directive.
 *
 * @param formatter - The Formatter instance from useFormatter() hook
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDateWithFormatter(
  formatter: ReturnType<typeof import("next-intl").useFormatter>,
  date: string | Date | null | undefined,
  options?: DateTimeFormatOptions
): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatter.dateTime(dateObj, options);
}

function getFormatterLocale(formatter?: ReturnType<typeof import("next-intl").useFormatter>): string | undefined {
  if (!formatter) return undefined;
  // next-intl's formatter may expose the locale; if not, callers can pass locale explicitly later.
  const maybe = formatter as unknown as { locale?: string };
  return maybe.locale ?? undefined;
}

/**
 * Client helper: format request date using `useFormatter()` result.
 * Falls back to server-side behaviour and applies Spanish/Catalan comma fix.
 */
export function formatRequestDateWithFormatter(
  formatter: ReturnType<typeof import("next-intl").useFormatter>,
  date: string | Date | null | undefined,
  locale?: string
): string {
  if (!date) return "";
  const resolvedLocale = locale ?? getFormatterLocale(formatter);
  const s = formatDateWithFormatter(formatter, date, REQUEST_DATE_FORMAT_OPTIONS);
  if (needsSpanishCatalanCommaFix(resolvedLocale)) return replaceLastDeWithComma(s);
  return s;
}

/**
 * Client helper: format request history (date + time) using `useFormatter()` result.
 * - English: 12-hour with AM/PM
 * - Spanish/Catalan: 24-hour
 */
export function formatRequestHistoryWithFormatter(
  formatter: ReturnType<typeof import("next-intl").useFormatter>,
  date: string | Date | null | undefined,
  locale?: string
): string {
  if (!date) return "";
  const resolvedLocale = locale ?? getFormatterLocale(formatter);
  const hour12 = !!(resolvedLocale && resolvedLocale.startsWith("en"));
  const options: DateTimeFormatOptions = {
    ...REQUEST_HISTORY_OPTIONS_BASE,
    hour12
  };

  const s = formatDateWithFormatter(formatter, date, options);
  if (needsSpanishCatalanCommaFix(resolvedLocale)) return replaceLastDeWithComma(s);
  return s;
}

/**
 * Generic client helper: format date/time with provided `options`, but pick 12/24h
 * based on locale when an hour field is present. Also applies Spanish/Catalan
 * comma fix for readability.
 */
export function formatDateTimeLocaleAwareWithFormatter(
  formatter: ReturnType<typeof import("next-intl").useFormatter>,
  date: string | Date | null | undefined,
  options?: DateTimeFormatOptions,
  locale?: string
): string {
  if (!date) return "";
  const resolvedLocale = locale ?? getFormatterLocale(formatter);
  const hasHour = options && ("hour" in options || "hour12" in options);
  const hour12 = hasHour ? !!(resolvedLocale && resolvedLocale.startsWith("en")) : undefined;

  const effectiveOptions: DateTimeFormatOptions | undefined = hasHour ? { ...(options ?? {}), hour12 } : options;

  const s = formatDateWithFormatter(formatter, date, effectiveOptions);
  if (needsSpanishCatalanCommaFix(resolvedLocale)) return replaceLastDeWithComma(s);
  return s;
}

/**
 * Convenience function for month/year formatting with formatter.
 * ONLY use this in Client Components with "use client" directive.
 */
export function formatMonthYearWithFormatter(
  formatter: ReturnType<typeof import("next-intl").useFormatter>,
  date: string | Date | null | undefined
): string {
  return formatDateWithFormatter(formatter, date, MONTH_YEAR_FORMAT_OPTIONS);
}

/**
 * Convenience function for full date-time formatting with formatter.
 * ONLY use this in Client Components with "use client" directive.
 */
export function formatDateTimeWithFormatter(
  formatter: ReturnType<typeof import("next-intl").useFormatter>,
  date: string | Date | null | undefined
): string {
  return formatDateWithFormatter(formatter, date, DATE_TIME_FORMAT_OPTIONS);
}
