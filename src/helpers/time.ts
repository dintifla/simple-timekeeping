/**
 * Converts a time string to a Date.
 * The date-part is set to today.
 * If parsing is not successful the current date is returned.
 * Milliseconds are zeroed.
 * @param t time in the format "HH:mm:ss" (e.g. 14:36:18")
 */
export function parseTime(t: string): Date {
  const d = new Date();
  const time = t.match(/(\d{1,2})(?:[:|.](\d{1,2}))?(?:[:|.](\d{1,2}))?/);
  if (!time) return d;
  d.setHours(parseInt(time[1]));
  d.setMinutes(parseInt(time[2]) || 0);
  d.setSeconds(parseInt(time[3]) || 0);
  d.setMilliseconds(0);
  return d;
}

export function roundTo100Ms(timestamp: Date): Date {
  timestamp.setMilliseconds(
    Math.round(timestamp.getMilliseconds() / 100) * 100
  );
  return timestamp;
}

  /**
   * Format the given milliseconds to HH:mm:ss.s
   */
   export function msToTime(ms: number): string {
    return new Date(ms).toISOString().substring(11, 21);
  }