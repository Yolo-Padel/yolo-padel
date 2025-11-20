/**
 * Utility untuk format time slots dengan handle continuous dan non-continuous slots
 */

type TimeSlot = {
  start: string;
  end: string;
};

/**
 * Parse slot string format "HH.MM–HH.MM" atau "HH:MM–HH:MM" ke object {start, end}
 */
function parseSlot(slot: string): TimeSlot {
  const [start, end] = slot.split("–").map((t) => t.trim());
  return {
    start: start.replace(/\./g, ":"),
    end: end.replace(/\./g, ":"),
  };
}

/**
 * Check apakah dua slot consecutive (tidak ada gap)
 */
function isConsecutive(slot1: TimeSlot, slot2: TimeSlot): boolean {
  return slot1.end === slot2.start;
}

/**
 * Group consecutive slots menjadi ranges
 * Example:
 * - ["07:00-08:00", "08:00-09:00"] → [["07:00-08:00", "08:00-09:00"]]
 * - ["07:00-08:00", "09:00-10:00"] → [["07:00-08:00"], ["09:00-10:00"]]
 */
function groupConsecutiveSlots(slots: string[]): string[][] {
  if (slots.length === 0) return [];

  const parsedSlots = slots.map(parseSlot);
  const groups: string[][] = [];
  let currentGroup: string[] = [slots[0]];

  for (let i = 1; i < parsedSlots.length; i++) {
    if (isConsecutive(parsedSlots[i - 1], parsedSlots[i])) {
      // Consecutive, add to current group
      currentGroup.push(slots[i]);
    } else {
      // Gap detected, start new group
      groups.push(currentGroup);
      currentGroup = [slots[i]];
    }
  }

  // Push last group
  groups.push(currentGroup);

  return groups;
}

/**
 * Format group of consecutive slots sebagai single range
 * Example: ["07:00-08:00", "08:00-09:00", "09:00-10:00"] → "07:00-10:00"
 */
function formatGroup(group: string[]): string {
  if (group.length === 0) return "";
  if (group.length === 1) {
    const parsed = parseSlot(group[0]);
    return `${parsed.start}-${parsed.end}`;
  }

  const firstSlot = parseSlot(group[0]);
  const lastSlot = parseSlot(group[group.length - 1]);
  return `${firstSlot.start}-${lastSlot.end}`;
}

/**
 * Format time slots dengan handle continuous dan non-continuous
 *
 * Examples:
 * - Continuous: ["07:00-08:00", "08:00-09:00"] → "07:00-09:00"
 * - Non-continuous: ["07:00-08:00", "09:00-10:00"] → "07:00-08:00, 09:00-10:00"
 * - Multiple gaps: ["07:00-08:00", "09:00-10:00", "10:00-11:00"] → "07:00-08:00, 09:00-11:00"
 */
export function formatTimeSlots(slots: string[]): string {
  if (slots.length === 0) return "";

  const groups = groupConsecutiveSlots(slots);
  return groups.map(formatGroup).join(", ");
}

/**
 * Check apakah semua slots continuous
 */
export function areSlotsContinuous(slots: string[]): boolean {
  if (slots.length <= 1) return true;

  const parsedSlots = slots.map(parseSlot);
  for (let i = 1; i < parsedSlots.length; i++) {
    if (!isConsecutive(parsedSlots[i - 1], parsedSlots[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Get total duration in hours (handle gaps)
 * Example: ["07:00-08:00", "09:00-10:00"] → 2 hours (not 3)
 */
export function getTotalDuration(slots: string[]): number {
  return slots.length;
}

/**
 * Get time range display (DEPRECATED - use formatTimeSlots instead)
 * Kept for backward compatibility
 */
export function getTimeRangeDisplay(slots: string[]): string {
  return formatTimeSlots(slots);
}

/**
 * Convert time from "HH:MM" format to "HH.MM" format for display
 * Example: "07:00" → "07.00"
 */
export function formatTimeDisplay(time: string): string {
  return time.replace(":", ".");
}

/**
 * Format time slots array from database into display format
 * Converts array of {openHour, closeHour} objects to "HH.MM-HH.MM" format
 * Example: [{openHour: "07:00", closeHour: "08:00"}, {openHour: "08:00", closeHour: "09:00"}] → "07.00-09.00"
 */
export function formatTimeRange(
  timeSlots: { openHour: string; closeHour: string }[]
): string {
  if (timeSlots.length === 0) return "N/A";
  const first = timeSlots[0];
  const last = timeSlots[timeSlots.length - 1];
  return `${formatTimeDisplay(first.openHour)}-${formatTimeDisplay(last.closeHour)}`;
}
