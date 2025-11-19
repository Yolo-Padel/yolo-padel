/**
 * Date utility functions
 * Centralized date manipulation and normalization logic
 */

/**
 * Normalizes a date to the start of the day in local timezone
 * Sets hours, minutes, seconds, and milliseconds to 0
 * 
 * @param date - Date to normalize
 * @returns New Date object set to 00:00:00.000 of the same day
 * 
 * @example
 * const date = new Date('2024-11-07T15:30:45.123Z');
 * const normalized = normalizeDateToStartOfDay(date);
 * // Returns: 2024-11-07T00:00:00.000 (local time)
 */
export function normalizeDateToStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Normalizes a date to the end of the day in local timezone
 * Sets time to 23:59:59.999
 * 
 * @param date - Date to normalize
 * @returns New Date object set to 23:59:59.999 of the same day
 * 
 * @example
 * const date = new Date('2024-11-07T15:30:45.123Z');
 * const normalized = normalizeDateToEndOfDay(date);
 * // Returns: 2024-11-07T23:59:59.999 (local time)
 */
export function normalizeDateToEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Normalizes a date to UTC start and end of day
 * Used for consistent database queries regardless of timezone
 * 
 * @param date - Date to normalize
 * @returns Object containing UTC start and end of day
 * 
 * @example
 * const date = new Date('2024-11-07T15:30:45.123Z');
 * const { startOfDay, endOfDay } = normalizeDateToUTC(date);
 * // startOfDay: 2024-11-07T00:00:00.000Z
 * // endOfDay:   2024-11-07T23:59:59.999Z
 */
export function normalizeDateToUTC(date: Date): {
  startOfDay: Date;
  endOfDay: Date;
} {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

  return { startOfDay, endOfDay };
}

/**
 * Checks if two dates are on the same day (ignoring time)
 * 
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns True if dates are on the same day
 * 
 * @example
 * const date1 = new Date('2024-11-07T10:00:00');
 * const date2 = new Date('2024-11-07T15:30:00');
 * isSameDay(date1, date2); // true
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

/**
 * Adds days to a date
 * 
 * @param date - Base date
 * @param days - Number of days to add (can be negative)
 * @returns New Date object with days added
 * 
 * @example
 * const today = new Date('2024-11-07');
 * const tomorrow = addDays(today, 1);
 * const yesterday = addDays(today, -1);
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Gets today's date normalized to start of day
 * 
 * @returns Today's date at 00:00:00.000
 */
export function getToday(): Date {
  return normalizeDateToStartOfDay(new Date());
}

/**
 * Gets tomorrow's date normalized to start of day
 * 
 * @returns Tomorrow's date at 00:00:00.000
 */
export function getTomorrow(): Date {
  return addDays(getToday(), 1);
}

