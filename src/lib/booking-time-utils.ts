/**
 * Utility functions for handling booking time formats and calculations
 */

/**
 * Parses booking time format "21.00–23.00" or "06.00AM-07.00AM" and extracts start time
 * @param bookingTime - Time string in format "HH.MM–HH.MM" or "HH.MMAM-HH.MMPM"
 * @returns Start time in "HH:MM" format or null if invalid
 */
export function parseBookingStartTime(bookingTime: string): string | null {
  if (!bookingTime) return null;

  console.log("parseBookingStartTime input:", bookingTime);

  // Handle different separators (–, -, —)
  const separators = ["–", "-", "—", " - ", " – ", " — "];
  let startTime = "";

  for (const separator of separators) {
    if (bookingTime.includes(separator)) {
      startTime = bookingTime.split(separator)[0]?.trim();
      break;
    }
  }

  console.log("extracted startTime:", startTime);

  if (!startTime) return null;

  // Handle AM/PM format: "06.00AM" -> "06:00"
  const ampmMatch = startTime.match(/^(\d{1,2})\.(\d{2})(AM|PM)$/i);
  if (ampmMatch) {
    const [, hours, minutes, ampm] = ampmMatch;
    let hour = parseInt(hours);

    console.log("AM/PM match:", { hours, minutes, ampm, originalHour: hour });

    // Convert to 24-hour format
    if (ampm.toUpperCase() === "PM" && hour !== 12) {
      hour += 12;
    } else if (ampm.toUpperCase() === "AM" && hour === 12) {
      hour = 0;
    }

    const result = `${hour.toString().padStart(2, "0")}:${minutes}`;
    console.log("AM/PM result:", result);
    return result;
  }

  // Convert "21.00" to "21:00"
  const timeMatch = startTime.match(/^(\d{1,2})\.(\d{2})$/);
  if (timeMatch) {
    const [, hours, minutes] = timeMatch;
    const result = `${hours.padStart(2, "0")}:${minutes}`;
    console.log("24-hour result:", result);
    return result;
  }

  // Already in "HH:MM" format
  const timeMatch2 = startTime.match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch2) {
    const [, hours, minutes] = timeMatch2;
    const result = `${hours.padStart(2, "0")}:${minutes}`;
    console.log("HH:MM result:", result);
    return result;
  }

  console.log("No match found, returning null");
  return null;
}

/**
 * Creates a target datetime by combining booking date and start time
 * @param bookingDate - The booking date (string or Date)
 * @param bookingTime - Time string in format "HH.MM–HH.MM"
 * @returns Target Date object or null if invalid
 */
export function createBookingStartDateTime(
  bookingDate: string | Date,
  bookingTime: string,
): Date | null {
  try {
    const startTime = parseBookingStartTime(bookingTime);
    if (!startTime) return null;

    const date =
      typeof bookingDate === "string" ? new Date(bookingDate) : bookingDate;
    if (isNaN(date.getTime())) return null;

    const [hours, minutes] = startTime.split(":").map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

    // Create new date with the booking date but set the time to start time
    const targetDate = new Date(date);
    targetDate.setHours(hours, minutes, 0, 0);

    return targetDate;
  } catch (error) {
    console.error("Error creating booking start datetime:", error);
    return null;
  }
}

/**
 * Checks if a booking is happening today and in the future
 * @param bookingDate - The booking date
 * @param bookingTime - Time string in format "HH.MM–HH.MM"
 * @returns True if booking is today and hasn't started yet
 */
export function isBookingUpcomingToday(
  bookingDate: string | Date,
  bookingTime: string,
): boolean {
  const targetDateTime = createBookingStartDateTime(bookingDate, bookingTime);
  if (!targetDateTime) return false;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const bookingDay = new Date(
    targetDateTime.getFullYear(),
    targetDateTime.getMonth(),
    targetDateTime.getDate(),
  );

  // Check if booking is today and in the future
  return (
    today.getTime() === bookingDay.getTime() &&
    targetDateTime.getTime() > now.getTime()
  );
}
