type DateTimeFormatOptions = ConstructorParameters<typeof Intl.DateTimeFormat>[1];

export function formatLocalizedDateTime(
  date: string | Date,
  locale: string,
  options: DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }
) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}
