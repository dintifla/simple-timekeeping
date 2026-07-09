import { parseTime } from './time';

/*
 * Formats the time part of a date to the de-CH locale in the Europe/Zurich
 * time zone. Example: "09:25:58".
 */
export function formatDateToTimeString(
  value: string | Date | undefined,
): string {
  if (!value) return '';
  let dateValue: Date;
  if (typeof value === 'string')
    dateValue = isTimeOnly(value) ? parseTime(value) : new Date(value);
  else dateValue = value;

  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Europe/Zurich',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  };

  const dateFormatter = new Intl.DateTimeFormat('de-CH', dateOptions);
  return dateFormatter.format(dateValue);
}

function isTimeOnly(value: string): boolean {
  return value.length === 8;
}
