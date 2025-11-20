// src/lib/booking-slots-utils.ts
import { DayOfWeek } from "@prisma/client";

type CourtWithOperatingHours = {
  id: string;
  operatingHours?: Array<{
    dayOfWeek: DayOfWeek;
    closed: boolean;
    slots: Array<{
      openHour: string;
      closeHour: string;
    }>;
  }>;
};

/**
 * Map JavaScript Date.getDay() to Prisma DayOfWeek enum
 * @param date JavaScript Date object
 * @returns DayOfWeek enum value or undefined
 */
export function getDayOfWeekKey(date?: Date): DayOfWeek | undefined {
  if (!date) return undefined;
  const js = date.getDay(); // 0=Sun..6=Sat
  const map: DayOfWeek[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return map[js];
}

/**
 * Generate hourly time slot labels from open and close time
 * @param open Open time in "HH:MM" format
 * @param close Close time in "HH:MM" format
 * @returns Array of time slot labels in "HH.mm–HH.mm" format
 */
export function generateHourlySlots(open: string, close: string): string[] {
  // expects "HH:MM"
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  const start = new Date(0, 0, 0, oh, om, 0);
  const end = new Date(0, 0, 0, ch, cm, 0);
  const out: string[] = [];
  const cur = new Date(start);

  while (cur < end) {
    const next = new Date(cur);
    next.setHours(next.getHours() + 1);
    if (next > end) break;

    const fmt = (d: Date) =>
      `${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`;
    out.push(`${fmt(cur)}–${fmt(next)}`);
    cur.setHours(cur.getHours() + 1);
  }

  return out;
}

/**
 * Get available time slots for a court on a specific date
 * @param court Court object with operating hours
 * @param date Selected date
 * @returns Array of available time slot labels
 */
export function getAvailableSlots(
  court: CourtWithOperatingHours | undefined,
  date: Date | undefined
): string[] {
  if (!court || !date) return [];

  const key = getDayOfWeekKey(date);
  if (!key) return [];

  const day = court.operatingHours?.find((d) => d.dayOfWeek === key);
  if (!day || day.closed) return [];

  const ranges = day.slots || [];
  const all: string[] = [];

  ranges.forEach((r) =>
    all.push(...generateHourlySlots(r.openHour, r.closeHour))
  );

  return all;
}

/**
 * Transform UI slot format to database format
 * @param slots Array of UI slot strings like "06.00–07.00"
 * @returns Array of {openHour, closeHour} objects
 */
export function transformUISlotsToDbFormat(
  slots: string[]
): Array<{ openHour: string; closeHour: string }> {
  return slots.map((slot) => {
    const [start, end] = slot.split("–");
    return {
      openHour: start.replace(".", ":"), // "06.00" → "06:00"
      closeHour: end.replace(".", ":"), // "07.00" → "07:00"
    };
  });
}

/**
 * Transform database format to UI slot format
 * Merges consecutive time slots and returns only the start and end times
 * @param timeSlots Array of {openHour, closeHour} objects
 * @returns Array of merged UI slot strings like "09.00–11.00" (merged from "09.00–10.00" and "10.00–11.00")
 * @example
 * // Input: [{openHour: "09:00", closeHour: "10:00"}, {openHour: "10:00", closeHour: "11:00"}]
 * // Output: ["09.00–11.00"]
 */
export function transformDbFormatToUISlots(
  timeSlots: Array<{ openHour: string; closeHour: string }>
): string[] {
  if (timeSlots.length === 0) return [];

  // Sort slots by openHour to ensure proper merging
  const sorted = [...timeSlots].sort((a, b) => {
    const [aHour, aMin] = a.openHour.split(":").map(Number);
    const [bHour, bMin] = b.openHour.split(":").map(Number);
    const aTotal = aHour * 60 + aMin;
    const bTotal = bHour * 60 + bMin;
    return aTotal - bTotal;
  });

  const merged: Array<{ openHour: string; closeHour: string }> = [];
  let currentRange: { openHour: string; closeHour: string } | null = null;

  for (const slot of sorted) {
    if (!currentRange) {
      // Start a new range
      currentRange = { ...slot };
    } else if (currentRange.closeHour === slot.openHour) {
      // Consecutive slot - extend the current range
      currentRange.closeHour = slot.closeHour;
    } else {
      // Gap found - save current range and start a new one
      merged.push(currentRange);
      currentRange = { ...slot };
    }
  }

  // Don't forget to add the last range
  if (currentRange) {
    merged.push(currentRange);
  }

  // Convert to UI format
  return merged.map((range) => {
    return `${range.openHour.replace(":", ".")}–${range.closeHour.replace(":", ".")}`;
  });
}

/**
 * Check if a slot overlaps with booked slots
 * @param slot Slot to check (UI format: "06.00–07.00")
 * @param bookedSlots Array of booked slots (UI format)
 * @returns boolean indicating if slot is booked
 */
export function isSlotBooked(slot: string, bookedSlots: string[]): boolean {
  if (bookedSlots.length === 0) return false;

  const [slotStart, slotEnd] = slot.split("–");
  const slotStartTime = slotStart.replace(".", ":");
  const slotEndTime = slotEnd.replace(".", ":");

  return bookedSlots.some((bookedSlot) => {
    const [bookedStart, bookedEnd] = bookedSlot.split("–");
    const bookedStartTime = bookedStart.replace(".", ":");
    const bookedEndTime = bookedEnd.replace(".", ":");

    // Check if slots overlap
    return (
      (slotStartTime < bookedEndTime && slotEndTime > bookedStartTime) ||
      (slotStartTime === bookedStartTime && slotEndTime === bookedEndTime)
    );
  });
}

/**
 * Filter out blocked slots from available slots
 * @param availableSlots Array of available time slots in UI format (e.g., "06.00–07.00")
 * @param blockedSlots Array of blocked time slots from blocking service (format: {openHour: "06:00", closeHour: "07:00"})
 * @returns Array of slots that are NOT blocked
 * @example
 * // availableSlots: ["06.00–07.00", "07.00–08.00", "08.00–09.00"]
 * // blockedSlots: [{openHour: "07:00", closeHour: "08:00"}]
 * // Returns: ["06.00–07.00", "08.00–09.00"]
 */
export function filterBlockedSlots(
  availableSlots: string[],
  blockedSlots: Array<{ openHour: string; closeHour: string }>
): string[] {
  if (blockedSlots.length === 0) return availableSlots;

  return availableSlots.filter((slot) => {
    const [slotStart, slotEnd] = slot.split("–");
    // Convert UI format "06.00" to DB format "06:00"
    const slotStartTime = slotStart.replace(".", ":");
    const slotEndTime = slotEnd.replace(".", ":");

    // Check if this slot is blocked
    const isBlocked = blockedSlots.some((blockedSlot) => {
      return (
        blockedSlot.openHour === slotStartTime &&
        blockedSlot.closeHour === slotEndTime
      );
    });

    // Keep slot if it's NOT blocked
    return !isBlocked;
  });
}

/**
 * Transform UI slot format to Order API format
 * @param slots Array of UI slot strings like "06.00–07.00"
 * @returns Array of Order API slot strings like "06:00-07:00"
 * @example
 * // Input: ["06.00–07.00", "07.00–08.00"]
 * // Output: ["06:00-07:00", "07:00-08:00"]
 */
export function transformUISlotsToOrderFormat(slots: string[]): string[] {
  return slots.map((slot) => {
    // "06.00–07.00" → "06:00-07:00"
    return slot.replace(/\./g, ":").replace("–", "-");
  });
}

/**
 * Normalize date to start of day in local timezone, then convert to ISO string
 * This prevents timezone issues when sending dates to the backend
 * @param date Date object (can be in any timezone)
 * @returns ISO string representing the start of day in local timezone
 * @example
 * // If user in WIB (UTC+7) selects Nov 9:
 * // Input: 2024-11-09T00:00:00+07:00
 * // Output: "2024-11-09T00:00:00.000Z" (but represents Nov 9 in local time, not UTC)
 */
export function normalizeDateToLocalStartOfDay(date: Date): string {
  // Create a new date object with the same year, month, and day in local timezone
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Create date at start of day (00:00:00) in local timezone
  const normalizedDate = new Date(year, month, day, 0, 0, 0, 0);

  // Format as YYYY-MM-DD to send only the date part
  // This ensures the date is preserved regardless of timezone
  const yearStr = String(normalizedDate.getFullYear()).padStart(4, "0");
  const monthStr = String(normalizedDate.getMonth() + 1).padStart(2, "0");
  const dayStr = String(normalizedDate.getDate()).padStart(2, "0");

  return `${yearStr}-${monthStr}-${dayStr}`;
}
