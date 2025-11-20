import { TIMETABLE_HOURS } from "@/constants/timetable";

/**
 * Timetable utility functions
 * Pure functions for time/date formatting and time slot generation
 */

/**
 * Generate array of hourly time slots from configured start to end hour
 * 
 * @returns Array of time strings in "HH:00" format
 * 
 * @example
 * generateTimeSlots()
 * // Returns: ["06:00", "07:00", "08:00", ..., "23:00"]
 */
export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = TIMETABLE_HOURS.START; hour < TIMETABLE_HOURS.END; hour++) {
    const time = `${String(hour).padStart(2, "0")}:00`;
    slots.push(time);
  }
  return slots;
}

/**
 * Format time for display by replacing colon with dot
 * 
 * @param time - Time string in "HH:mm" format
 * @returns Formatted time in "HH.mm" format
 * 
 * @example
 * formatTimeDisplay("06:00") // Returns: "06.00"
 */
export function formatTimeDisplay(time: string): string {
  return time.replace(":", ".");
}

// Format waktu untuk display dengan AM/PM: "06:00" -> "06.00AM"
export function formatTimeWithAMPM(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${String(displayHour).padStart(2, "0")}.${minutes}${ampm}`;
}

// Format waktu range: ["06:00", "07:00"] -> "06.00AM-07.00AM"
export function formatTimeRange(
  timeSlots: Array<{ openHour: string; closeHour: string }>
): string {
  if (timeSlots.length === 0) return "";
  const first = timeSlots[0];
  const last = timeSlots[timeSlots.length - 1];
  return `${formatTimeWithAMPM(first.openHour)}-${formatTimeWithAMPM(last.closeHour)}`;
}

// Get next hour: "06:00" -> "07:00"
export function getNextHour(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const nextHour = (hours + 1) % 24;
  return `${String(nextHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Format operating hours: "10:00" -> "20:00" -> "10.00AM-20.00PM"
export function formatOperatingHours(openHour: string, closeHour: string): string {
  return `${formatTimeWithAMPM(openHour)}-${formatTimeWithAMPM(closeHour)}`;
}

/**
 * Check if a time slot is within court operating hours
 * @param timeSlot - Time slot string in "HH:00" format (e.g., "06:00", "07:00")
 * @param operatingHours - Court operating hours with slots
 * @returns true if time slot is within operating hours, false otherwise
 * 
 * @example
 * isTimeSlotInOperatingHours("06:00", { closed: false, slots: [{ openHour: "07:00", closeHour: "23:00" }] })
 * // Returns: false (06:00 is before 07:00)
 * 
 * isTimeSlotInOperatingHours("08:00", { closed: false, slots: [{ openHour: "07:00", closeHour: "23:00" }] })
 * // Returns: true (08:00 is between 07:00 and 23:00)
 */
export function isTimeSlotInOperatingHours(
  timeSlot: string,
  operatingHours?: {
    closed: boolean;
    slots: Array<{
      openHour: string;
      closeHour: string;
    }>;
  }
): boolean {
  // If no operating hours data, assume it's open (backward compatibility)
  if (!operatingHours) return true;

  // If court is closed, time slot is not available
  if (operatingHours.closed) return false;

  // If no slots, assume it's closed
  if (!operatingHours.slots || operatingHours.slots.length === 0) return false;

  // Check if time slot is within any of the operating hour slots
  // Time slot format: "HH:00" (e.g., "06:00", "07:00")
  // We check if the time slot hour is >= openHour and < closeHour
  return operatingHours.slots.some((slot) => {
    return timeSlot >= slot.openHour && timeSlot < slot.closeHour;
  });
}

