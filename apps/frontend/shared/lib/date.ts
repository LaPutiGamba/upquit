type DateTimeFormatOptions = ConstructorParameters<typeof Intl.DateTimeFormat>[1];

export function formatLocalizedDateTime(
  date: string | Date,
  locale: string | undefined,
  options: DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }
) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}

export function formatLocalizedDateTimeWithClock(date: string | Date, locale?: string) {
  return formatLocalizedDateTime(date, locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
