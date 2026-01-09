import { format } from "date-fns";
import type { Booking } from "./timetable-types";
import type { BookingSlotInfo } from "./timetable-types";
import { getNextHour } from "./timetable-utils";

type BookingSegment = {
  start: string;
  end: string;
};

/**
 * Hitung berapa banyak slot jam yang ditempati oleh satu segmen booking kontinyu.
 *
 * @param segment - Segment booking kontinyu (contoh: 10:00-13:00)
 * @param timeSlots - Semua slot waktu yang tersedia
 */
export function calculateBookingSpan(
  segment: BookingSegment,
  timeSlots: string[],
): number {
  if (!segment) return 1;

  const bookingStart = segment.start;
  // Normalize "00:00" to "24:00" for midnight-crossing bookings
  const bookingEnd = segment.end === "00:00" ? "24:00" : segment.end;

  let startIndex = -1;
  let endIndex = -1;

  for (let i = 0; i < timeSlots.length; i++) {
    const slotStart = timeSlots[i];
    const slotEnd = getNextHour(slotStart);
    // Normalize slot end for comparison (23:00 -> 00:00 becomes 24:00)
    const normalizedSlotEnd = slotEnd === "00:00" ? "24:00" : slotEnd;

    if (startIndex === -1 && slotStart === bookingStart) {
      startIndex = i;
    }

    if (normalizedSlotEnd === bookingEnd) {
      endIndex = i;
    }
  }

  if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
    return endIndex - startIndex + 1;
  }

  // Fallback calculation using minutes
  const [startHour, startMin] = bookingStart.split(":").map(Number);
  const [endHour, endMin] = bookingEnd.split(":").map(Number);
  const startMinutes = startHour * 60 + startMin;
  // Handle midnight: "24:00" means 24*60 = 1440 minutes
  const endMinutes = endHour * 60 + endMin;
  const durationMinutes = endMinutes - startMinutes;
  const durationHours = Math.ceil(durationMinutes / 60);

  return Math.max(1, durationHours);
}

function groupContinuousBookingSlots(
  timeSlots: Booking["timeSlots"],
): BookingSegment[] {
  if (timeSlots.length === 0) return [];

  const sorted = [...timeSlots].sort((a, b) =>
    a.openHour > b.openHour ? 1 : -1,
  );
  const segments: BookingSegment[] = [];

  let currentStart = sorted[0].openHour;
  let currentEnd = sorted[0].closeHour;

  for (let i = 1; i < sorted.length; i++) {
    const slot = sorted[i];
    if (slot.openHour === currentEnd) {
      currentEnd = slot.closeHour;
    } else {
      segments.push({ start: currentStart, end: currentEnd });
      currentStart = slot.openHour;
      currentEnd = slot.closeHour;
    }
  }

  segments.push({ start: currentStart, end: currentEnd });
  return segments;
}

/**
 * Normalize time for comparison, treating "00:00" as "24:00" for end times
 * This handles midnight-crossing bookings (e.g., 23:00-00:00)
 */
function normalizeTimeForComparison(time: string, isEndTime: boolean): string {
  if (isEndTime && time === "00:00") {
    return "24:00";
  }
  return time;
}

/**
 * Determines if a time slot contains a booking and calculates rendering information
 *
 * This function checks if a given time slot overlaps with any booking and returns
 * information needed for rendering (span, whether it's the first cell, etc.)
 *
 * @param timeSlot - Current time slot being checked (format: "HH:00", e.g., "10:00")
 * @param timeSlotIndex - Index of the time slot in the allTimeSlots array
 * @param courtId - ID of the court to check bookings for
 * @param bookings - Array of all bookings for the selected date
 * @param selectedDate - Date being displayed in the timetable
 * @param allTimeSlots - Complete array of time slots for span calculation
 *
 * @returns BookingSlotInfo object if slot contains a booking, null otherwise
 *          - booking: The booking object
 *          - isFirstSlot: true if this is the first cell of a multi-hour booking
 *          - span: number of cells this booking should span (for colspan attribute)
 *                  - > 0 for first slot (actual span count)
 *                  - = 0 for continuation slots (should not render, merged via colspan)
 *
 * @example
 * // Booking from 10:00-12:00 on Court 1, checking 10:00 slot
 * getTimeSlotBooking("10:00", 4, "court-1", bookings, date, slots)
 * // Returns: { booking: {...}, isFirstSlot: true, span: 2 }
 *
 * @example
 * // Same booking, checking 11:00 slot (continuation)
 * getTimeSlotBooking("11:00", 5, "court-1", bookings, date, slots)
 * // Returns: { booking: {...}, isFirstSlot: false, span: 0 }
 */
export function getTimeSlotBooking(
  timeSlot: string,
  timeSlotIndex: number,
  courtId: string,
  bookings: Booking[],
  selectedDate: Date,
  allTimeSlots: string[],
): BookingSlotInfo | null {
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  for (const booking of bookings) {
    if (booking.courtId !== courtId) continue;

    const bookingDateStr = format(booking.bookingDate, "yyyy-MM-dd");
    if (bookingDateStr !== dateStr) continue;

    if (booking.status === "CANCELLED") continue;

    if (booking.timeSlots.length === 0) continue;

    const segments = groupContinuousBookingSlots(booking.timeSlots);

    // Check if this hourly time slot is within the booking range
    const timeStart = timeSlot;
    const timeEnd = normalizeTimeForComparison(getNextHour(timeSlot), true);

    for (const segment of segments) {
      // Normalize segment end time for midnight-crossing bookings (e.g., 23:00-00:00)
      const segmentEnd = normalizeTimeForComparison(segment.end, true);

      // Check if time slot is outside the segment range
      if (timeStart >= segmentEnd || timeEnd <= segment.start) continue;

      const isFirstSlot = timeStart === segment.start;

      if (isFirstSlot) {
        const span = calculateBookingSpan(segment, allTimeSlots);
        return { booking, isFirstSlot: true, span };
      }
      return { booking, isFirstSlot: false, span: 0 };
    }
  }

  return null;
}
