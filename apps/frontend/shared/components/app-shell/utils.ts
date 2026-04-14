export function getInitials(value: string): string {
  return value
    .split(" ")
    .map((part) => part.at(0) ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getBoardFallbackLetter(value: string): string {
  return value.charAt(0).toUpperCase();
}
