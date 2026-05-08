// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DateTimeFormatOptions = any;

export const DATE_FORMAT_OPTIONS: DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric"
};

export const DATE_TIME_FORMAT_OPTIONS: DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
};

export const MONTH_YEAR_FORMAT_OPTIONS: DateTimeFormatOptions = {
  year: "numeric",
  month: "long"
};

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
export function formatLocalizedDateTime(
  date: string | Date,
  locale: string | undefined,
  options: DateTimeFormatOptions = DATE_FORMAT_OPTIONS
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}

/**
 * Format date with clock. This version should ONLY be used in Server Components.
 *
 * @deprecated Use formatDateTimeWithFormatter() in Client Components
 * @param date - Date to format
 * @param locale - Locale string (e.g., "en-US")
 * @returns Formatted date-time string
 */
export function formatLocalizedDateTimeWithClock(date: string | Date, locale?: string): string {
  return formatLocalizedDateTime(date, locale, DATE_TIME_FORMAT_OPTIONS);
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
