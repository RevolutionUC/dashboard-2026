export function toISOStringWithTimezone(datetimeLocal: string): string {
  const date = new Date(datetimeLocal);
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const offsetHours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, "0");
  const offsetMinutes = (Math.abs(offset) % 60).toString().padStart(2, "0");
  return `${datetimeLocal}:00${sign}${offsetHours}:${offsetMinutes}`;
}
