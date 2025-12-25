import { requirePermission, ServiceContext } from "@/types/service-context";
import {
  CancelCourtsideBooking,
  CreateCourtsideBooking,
  GetCourtsideBooking,
} from "../validations/courtside.validation";
import { UserType } from "@/types/prisma";
import { decrypt } from "../utils/encryption";

const BASE_URL = process.env.COURTSIDE_BASE_URL;

if (!BASE_URL) {
  throw new Error("COURTSIDE_BASE_URL is not defined");
}

export interface GetBookingResult {
  status: boolean;
  data: BookingPerCourt[];
}

export interface BookingPerCourt {
  court_id: string;
  name: string;
  booked_time: BookedTime | [];
}

export interface BookedTime {
  "booking-court": BookingCourt[];
}

export interface BookingCourt {
  booking_id: string;
  start_hours: string;
  service_menit: number;
  modul_type: string;
  user_name: string;
  user_email: string;
  user_mobile: string;
}

export interface TimeSlot {
  openHour: string;
  closeHour: string;
}

export interface Blocking {
  id: string;
  bookingId: string;
  isBlocking: boolean;
  booking: {
    id: string;
    courtId: string;
    bookingDate: Date;
    timeSlots: TimeSlot[];
  };
}

/**
 * Generate hourly time slots from start hour and duration
 * @param startHour - Start time in "HH.mm" format (e.g., "07.00")
 * @param serviceMenit - Duration in minutes (e.g., 120)
 * @returns Array of hourly time slots (e.g., [{openHour: "07:00", closeHour: "08:00"}, {openHour: "08:00", closeHour: "09:00"}])
 */
function generateHourlyTimeSlots(
  startHour: string,
  serviceMenit: number,
): TimeSlot[] {
  const [hours, minutes] = startHour.split(".").map(Number);
  const startTotalMinutes = hours * 60 + minutes;
  const numberOfHours = Math.ceil(serviceMenit / 60);

  const timeSlots: TimeSlot[] = [];

  for (let i = 0; i < numberOfHours; i++) {
    const slotStartMinutes = startTotalMinutes + i * 60;
    const slotEndMinutes = slotStartMinutes + 60;

    const openHours = Math.floor(slotStartMinutes / 60) % 24;
    const openMinutes = slotStartMinutes % 60;
    const closeHours = Math.floor(slotEndMinutes / 60) % 24;
    const closeMinutes = slotEndMinutes % 60;

    timeSlots.push({
      openHour: `${openHours.toString().padStart(2, "0")}:${openMinutes.toString().padStart(2, "0")}`,
      closeHour: `${closeHours.toString().padStart(2, "0")}:${closeMinutes.toString().padStart(2, "0")}`,
    });
  }

  return timeSlots;
}
export interface GetCourtsideBookingsByVenueRequest {
  apiKey: string;
  bookingDate: string;
  courts: { courtId: string; courtsideCourtId: string }[];
}

/**
 * Function to fetch courtside booking data for all courts in a venue.
 * Returns blockings for all courts mapped to internal courtIds.
 */
export async function getCourtsideBookingsByVenue(
  request: GetCourtsideBookingsByVenueRequest,
  context: ServiceContext,
) {
  const accessError = requirePermission(context, UserType.STAFF);
  if (accessError) return accessError;

  const decryptedApiKey = decrypt(request.apiKey);

  const response = await fetch(`${BASE_URL}/api/public/admin/schedule/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "API-KEY": decryptedApiKey,
    },
    body: JSON.stringify({
      date: request.bookingDate,
    }),
  });

  if (!response.ok) {
    throw new Error(`Courtside API error: ${response.status}`);
  }

  const parsed: GetBookingResult = await response.json();

  // Build a map of courtsideCourtId -> internal courtId
  const courtIdMap = new Map<string, string>();
  for (const court of request.courts) {
    if (court.courtsideCourtId) {
      courtIdMap.set(court.courtsideCourtId, court.courtId);
    }
  }

  // Handle the weird API response where bookedTime is [] when empty, but object when has data
  const hasBookings = (
    bookedTime: BookedTime | [],
  ): bookedTime is BookedTime => {
    return !Array.isArray(bookedTime) && "booking-court" in bookedTime;
  };

  const allBlockings: Blocking[] = [];

  for (const courtData of parsed.data) {
    const internalCourtId = courtIdMap.get(courtData.court_id);
    if (!internalCourtId) continue; // Skip courts not in our system

    if (!hasBookings(courtData.booked_time)) continue;

    const bookings = courtData.booked_time["booking-court"];

    for (const booking of bookings) {
      const timeSlots = generateHourlyTimeSlots(
        booking.start_hours,
        booking.service_menit,
      );

      allBlockings.push({
        id: booking.booking_id,
        bookingId: booking.booking_id,
        isBlocking: true,
        booking: {
          id: booking.booking_id,
          courtId: internalCourtId,
          bookingDate: new Date(request.bookingDate),
          timeSlots,
        },
      });
    }
  }

  return allBlockings;
}

/**
 * Function to fetch courtside booking data from the API.
 * Reference: https://documenter.getpostman.com/view/18532675/2sB2cYd13H#ce2d98c3-e61b-4e22-896f-892e82774d59
 */
export async function getCourtsideBooking(
  request: GetCourtsideBooking,
  context: ServiceContext,
) {
  const accessError = requirePermission(context, UserType.USER);
  if (accessError) return accessError;

  const decryptedApiKey = decrypt(request.apiKey);

  const response = await fetch(`${BASE_URL}/api/public/admin/schedule/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "API-KEY": decryptedApiKey,
    },
    body: JSON.stringify({
      date: request.bookingDate,
    }),
  });

  const parsed: GetBookingResult = await response.json();
  const databyCourt = parsed.data.find(
    (court) => court.court_id === request.courtsideCourtId,
  );

  // Handle the weird API response where bookedTime is [] when empty, but object when has data
  const hasBookings = (
    bookedTime: BookedTime | [],
  ): bookedTime is BookedTime => {
    return !Array.isArray(bookedTime) && "booking-court" in bookedTime;
  };

  const bookings =
    databyCourt && hasBookings(databyCourt.booked_time)
      ? databyCourt.booked_time["booking-court"]
      : [];

  const blockingResponse = bookings.map((booking: BookingCourt) => {
    const timeSlots = generateHourlyTimeSlots(
      booking.start_hours,
      booking.service_menit,
    );
    const blocking: Blocking = {
      id: booking.booking_id,
      bookingId: booking.booking_id,
      isBlocking: true,
      booking: {
        id: booking.booking_id,
        courtId: request.courtsideCourtId,
        bookingDate: new Date(request.bookingDate),
        timeSlots,
      },
    };
    return blocking;
  });

  if (!response.ok) {
    throw new Error(`Courtside API error: ${response.status}`);
  }

  return blockingResponse;
}

/**
 * Function to create a courtside booking.
 * Reference: https://documenter.getpostman.com/view/18532675/2sB2cYd13H#5fdb3fd2-91b7-4346-9cba-6e79a979f5eb
 */
export async function createCourtsideBooking(
  request: CreateCourtsideBooking,
  context: ServiceContext,
) {
  const accessError = requirePermission(context, UserType.USER);
  if (accessError) return accessError;

  const { apiKey, ...bookingData } = request;

  const decryptedApiKey = decrypt(apiKey);

  const response = await fetch(`${BASE_URL}/api/public/admin/court-booking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "API-KEY": decryptedApiKey,
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    throw new Error(`Courtside API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Function to cancel a courtside booking.
 * This Function do not need ServiceContext as most likely will be called by system
 * Reference: https://documenter.getpostman.com/view/18532675/2sB2cYd13H#f0f840a6-5d49-4afb-bc62-0f7c20880b4b
 */
export async function cancelCourtsideBooking(request: CancelCourtsideBooking) {
  const { apiKey, ...cancelData } = request;

  const decryptedApiKey = decrypt(apiKey);

  const response = await fetch(
    `${BASE_URL}/api/public/admin/cancel-court-booking`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "API-KEY": decryptedApiKey,
      },
      body: JSON.stringify(cancelData),
    },
  );

  if (!response.ok) {
    throw new Error(`Courtside API error: ${response.status}`);
  }

  return response.json();
}
