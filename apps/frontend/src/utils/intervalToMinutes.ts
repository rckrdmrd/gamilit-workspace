/**
 * Interval to Minutes Utility
 *
 * Converts PostgreSQL interval strings to minutes.
 *
 * @description
 * PostgreSQL stores time intervals in the format "HH:MM:SS" (e.g., "02:30:00" for 2 hours 30 minutes).
 * This utility converts these intervals to total minutes for easier manipulation in the frontend.
 *
 * @example
 * ```ts
 * intervalToMinutes("02:30:00") // 150 (2 hours * 60 + 30 minutes)
 * intervalToMinutes("00:45:00") // 45
 * intervalToMinutes("10:15:30") // 615 (ignores seconds)
 * intervalToMinutes(null)       // 0
 * intervalToMinutes("")         // 0
 * ```
 */

/**
 * Convert PostgreSQL interval string to total minutes
 *
 * @param interval - PostgreSQL interval string in format "HH:MM:SS" or null
 * @returns Total minutes as integer (seconds are ignored)
 *
 * @example
 * ```ts
 * // Convert study time from API
 * const apiResponse = { total_time_spent: "02:30:00" };
 * const minutes = intervalToMinutes(apiResponse.total_time_spent);
 * console.log(minutes); // 150
 * ```
 */
export function intervalToMinutes(interval: string | null): number {
  // Handle null or empty string
  if (!interval) return 0;

  // Match HH:MM:SS format
  const match = interval.match(/^(\d+):(\d+):(\d+)$/);
  if (!match) return 0;

  const [, hours, minutes] = match;

  // Convert to total minutes (ignore seconds)
  return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
}
