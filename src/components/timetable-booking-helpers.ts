import { format } from "date-fns";
import type { Booking } from "./timetable-types";
import type { BookingSlotInfo } from "./timetable-types";
import { getNextHour } from "./timetable-utils";

/**
 * Calculate how many hourly time slots a booking spans
 * 
 * @param booking - The booking to calculate span for
 * @param timeSlots - Array of all available time slots (e.g., ["06:00", "07:00", ...])
 * @returns Number of hourly time slots the booking spans
 * 
 * @example
 * // Booking from 06:00-08:00 spans 2 hourly slots
 * const booking = {
 *   timeSlots: [
 *     { openHour: "06:00", closeHour: "07:00" },
 *     { openHour: "07:00", closeHour: "08:00" }
 *   ]
 * };
 * calculateBookingSpan(booking, ["06:00", "07:00", "08:00"]); // Returns: 2
 */
export function calculateBookingSpan(
  booking: Booking,
  timeSlots: string[]
): number {
  if (booking.timeSlots.length === 0) return 1;

  // Find the first and last time slot of the booking
  const firstSlot = booking.timeSlots[0];
  const lastSlot = booking.timeSlots[booking.timeSlots.length - 1];

  const bookingStart = firstSlot.openHour;
  const bookingEnd = lastSlot.closeHour;

  // Find which hourly time slots are covered
  // We need to find the first time slot that starts at or before bookingStart
  // and the last time slot that ends at or after bookingEnd
  let startIndex = -1;
  let endIndex = -1;

  for (let i = 0; i < timeSlots.length; i++) {
    const slotStart = timeSlots[i];
    const slotEnd = getNextHour(slotStart);

    // Find the first slot where the slot starts exactly at bookingStart
    if (startIndex === -1 && slotStart === bookingStart) {
      startIndex = i;
    }

    // Find the last slot where the slot end is at or before bookingEnd
    // But we want the slot that ends exactly at bookingEnd
    if (slotEnd === bookingEnd) {
      endIndex = i;
    }
  }

  // If we found both indices, calculate span
  if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
    return endIndex - startIndex + 1;
  }

  // Fallback: calculate based on duration
  // If booking is 06:00-08:00, that's 2 hours = 2 slots
  const [startHour, startMin] = bookingStart.split(":").map(Number);
  const [endHour, endMin] = bookingEnd.split(":").map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const durationMinutes = endMinutes - startMinutes;
  const durationHours = Math.ceil(durationMinutes / 60);

  return Math.max(1, durationHours);
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
  allTimeSlots: string[]
): BookingSlotInfo | null {
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  for (const booking of bookings) {
    if (booking.courtId !== courtId) continue;

    const bookingDateStr = format(booking.bookingDate, "yyyy-MM-dd");
    if (bookingDateStr !== dateStr) continue;

    if (booking.status === "CANCELLED") continue;

    if (booking.timeSlots.length === 0) continue;

    // Get the first time slot's start time
    const firstSlotStart = booking.timeSlots[0].openHour;
    const lastSlot = booking.timeSlots[booking.timeSlots.length - 1];
    const bookingEnd = lastSlot.closeHour;

    // Check if this hourly time slot is within the booking range
    const [timeStart, timeEnd] = [timeSlot, getNextHour(timeSlot)];

    // Check if this time slot overlaps with the booking
    if (timeStart < bookingEnd && timeEnd > firstSlotStart) {
      // Check if this is the first hourly slot of the booking
      const isFirstSlot = timeStart === firstSlotStart;

      if (isFirstSlot) {
        // Calculate span only for first slot
        const span = calculateBookingSpan(booking, allTimeSlots);
        return { booking, isFirstSlot: true, span };
      } else {
        // This is a continuation slot, return a marker so we can skip rendering
        // We'll use a special marker to identify continuation slots
        return { booking, isFirstSlot: false, span: 0 };
      }
    }
  }

  return null;
}
