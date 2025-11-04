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
 * @param timeSlots Array of {openHour, closeHour} objects
 * @returns Array of UI slot strings like "06.00–07.00"
 */
export function transformDbFormatToUISlots(
  timeSlots: Array<{ openHour: string; closeHour: string }>
): string[] {
  return timeSlots.map((ts) => {
    return `${ts.openHour.replace(":", ".")}–${ts.closeHour.replace(":", ".")}`;
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
