import { prisma } from "@/lib/prisma";
import { ManualBookingInput } from "@/lib/validations/manual-booking.validation";
import { bookingService, createBooking } from "@/lib/services/booking.service";
import { createBlocking } from "@/lib/services/blocking.service";
import { createCourtsideBooking } from "@/lib/services/courtside.service";
import { resendService } from "@/lib/services/resend.service";
import {
  activityLogService,
  entityReferenceHelpers,
} from "@/lib/services/activity-log.service";
import { calculateSlotsPrice } from "@/lib/booking-pricing-utils";
import {
  groupContinuousSlots,
  buildCourtsidePayload,
  TimeSlot as CourtsideTimeSlot,
} from "@/lib/services/order.service";
import { ServiceContext, requirePermission } from "@/types/service-context";
import { BookingStatus, UserType, UserStatus } from "@/types/prisma";
import { ACTION_TYPES } from "@/types/action";
import { ENTITY_TYPES } from "@/types/entity";
import { customAlphabet } from "nanoid";

type TimeSlot = { openHour: string; closeHour: string };

const bookingCodeGenerator = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  5,
);

function parseBookingDate(dateString: string | Date): Date {
  // If already Date object, use it directly
  if (dateString instanceof Date) {
    return dateString;
  }

  if (dateString.includes("T")) {
    return new Date(dateString);
  }
  // Parse as local date (not UTC) to preserve exact date selected by user
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 7, 0, 0, 0);
}

function timeToMinutes(time: string): number {
  if (time === "24:00") return 24 * 60;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const clamped = Math.min(Math.max(minutes, 0), 24 * 60);
  const hours = Math.floor(clamped / 60);
  const mins = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function buildTimeSlots(startTime: string, endTime: string): TimeSlot[] {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (end <= start) return [];

  const slots: TimeSlot[] = [];
  let cursor = start;

  while (cursor < end) {
    const next = cursor + 60;
    if (next > end) {
      return [];
    }
    slots.push({
      openHour: minutesToTime(cursor),
      closeHour: minutesToTime(next),
    });
    cursor = next;
  }

  return slots;
}

function toUiSlot(slot: TimeSlot): string {
  const format = (value: string) => value.replace(":", ".");
  return `${format(slot.openHour)}–${format(slot.closeHour)}`;
}

function deriveFullName(email: string): string {
  const localPart = email.split("@")[0] || "Manual Booking";
  return (
    localPart
      .split(/[\.\-_]/)
      .filter(Boolean)
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(" ")
      .trim() || "Manual Booking Customer"
  );
}

function getLoginUrl(): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://yolo-padel.com";
  return `${baseUrl}/auth`;
}

/**
 * Sync manual booking to Courtside external system
 *
 * This function handles the integration with Courtside for manual bookings.
 * It applies the same logic as online bookings (Requirement 4.1, 4.2).
 *
 * Key behaviors:
 * - Skips if court has no courtsideCourtId (Requirement 1.2)
 * - Skips if venue has no courtsideApiKey (Requirement 1.3)
 * - Groups continuous time slots into single Courtside bookings (Requirement 2.1)
 * - Creates multiple Courtside bookings for non-continuous slots (Requirement 2.2)
 * - Uses booking code as offline_user for traceability (Requirement 2.4)
 * - Stores first Courtside booking ID in booking record (Requirement 1.4)
 * - Errors are logged but don't fail the booking (fire-and-forget)
 *
 * @param bookingData - The manual booking data
 * @param context - Service context for authorization
 *
 * Requirements: 4.1, 4.2
 */
async function syncManualBookingToCourtside(
  bookingData: {
    bookingId: string;
    bookingCode: string;
    courtId: string;
    bookingDate: Date;
    timeSlots: TimeSlot[];
    pricePerSlot: number;
  },
  context: ServiceContext,
): Promise<void> {
  try {
    // Fetch court with venue info for Courtside integration
    const court = await prisma.court.findUnique({
      where: { id: bookingData.courtId },
      select: {
        id: true,
        courtsideCourtId: true,
        venue: {
          select: {
            id: true,
            courtsideApiKey: true,
          },
        },
      },
    });

    // Requirement 1.2: Skip if court has no courtsideCourtId
    if (!court?.courtsideCourtId) {
      console.log(
        `[Courtside Sync] Skipping manual booking ${bookingData.bookingCode}: No courtsideCourtId configured for court ${bookingData.courtId}`,
      );
      return;
    }

    // Requirement 1.3: Skip if venue has no courtsideApiKey
    if (!court.venue?.courtsideApiKey) {
      console.log(
        `[Courtside Sync] Skipping manual booking ${bookingData.bookingCode}: No courtsideApiKey configured for venue`,
      );
      return;
    }

    // Convert TimeSlot to CourtsideTimeSlot format
    const courtsideTimeSlots: CourtsideTimeSlot[] = bookingData.timeSlots.map(
      (slot) => ({
        openHour: slot.openHour,
        closeHour: slot.closeHour,
      }),
    );

    // Group continuous slots for Courtside (Requirements 2.1, 2.2)
    const slotGroups = groupContinuousSlots(courtsideTimeSlots);

    // Track first Courtside booking ID for storage
    let firstCourtsideBookingId: string | null = null;

    // Create Courtside booking for each slot group
    for (const slotGroup of slotGroups) {
      // Build Courtside payload (Requirements 3.1-3.10)
      const payload = buildCourtsidePayload(
        bookingData.bookingCode,
        bookingData.bookingDate,
        slotGroup,
        court.courtsideCourtId,
        bookingData.pricePerSlot,
      );

      // Call Courtside API with required fields
      const courtsideRequest = {
        apiKey: court.venue.courtsideApiKey,
        ...payload,
        createdInternalBookingId: bookingData.bookingId,
      };

      // Create Courtside booking using existing service
      const courtsideResponse = await createCourtsideBooking(
        courtsideRequest,
        context,
      );

      // Store first Courtside booking ID (Requirement 1.4)
      if (!firstCourtsideBookingId && courtsideResponse?.data?.id) {
        firstCourtsideBookingId = courtsideResponse.data.id;
      }

      console.log(
        `[Courtside Sync] Created Courtside booking for manual booking ${bookingData.bookingCode}: ${slotGroup.startHour} (${slotGroup.duration}h)`,
      );
    }

    // Requirement 1.4: Store first Courtside booking ID in booking record
    if (firstCourtsideBookingId) {
      await prisma.booking.update({
        where: { id: bookingData.bookingId },
        data: { courtsideBookingId: firstCourtsideBookingId },
      });

      console.log(
        `[Courtside Sync] Stored Courtside booking ID ${firstCourtsideBookingId} for manual booking ${bookingData.bookingCode}`,
      );
    }
  } catch (error) {
    // Fire-and-forget: Log error but don't fail the booking
    console.error(
      `[Courtside Sync] Error syncing manual booking ${bookingData.bookingCode} to Courtside:`,
      error,
    );
    // Don't throw - manual booking should succeed even if Courtside sync fails
  }
}

export const manualBookingService = {
  create: async (data: ManualBookingInput, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, UserType.STAFF);
      if (accessError) return accessError;

      const slots = buildTimeSlots(data.startTime, data.endTime);
      if (slots.length === 0) {
        return {
          success: false,
          data: null,
          message: "Invalid time range selected",
        };
      }

      const court = await prisma.court.findUnique({
        where: { id: data.courtId },
        include: {
          venue: true,
          dynamicPrices: {
            where: {
              isArchived: false,
            },
            include: {
              court: true,
            },
          },
        },
      });

      if (!court || court.isArchived) {
        return {
          success: false,
          data: null,
          message: "Court not found or already inactive",
        };
      }

      if (court.venueId !== data.venueId) {
        return {
          success: false,
          data: null,
          message: "Venue does not match the selected court",
        };
      }

      const bookingDate = parseBookingDate(data.date);
      const availability = await bookingService.checkAvailability(
        data.courtId,
        bookingDate,
        slots,
      );

      if (!availability.success) {
        return {
          success: false,
          data: null,
          message: availability.message,
        };
      }

      if (!availability.data?.available) {
        return {
          success: false,
          data: availability.data,
          message: "Time slot is already occupied, please select another time",
        };
      }

      const uiSlots = slots.map(toUiSlot);
      const { totalPrice } = calculateSlotsPrice(
        uiSlots,
        bookingDate,
        court.price,
        court.dynamicPrices || [],
      );

      const loginUrl = getLoginUrl();

      const result = await prisma.$transaction(async (tx) => {
        let user = await tx.user.findUnique({
          where: { email: data.email },
          include: { profile: true },
        });

        if (user?.isArchived) {
          throw new Error(
            "Email is archived and cannot be used for manual booking",
          );
        }

        if (!user) {
          const createdUser = await tx.user.create({
            data: {
              email: data.email,
              password: "",
              userType: UserType.USER,
              userStatus: UserStatus.JOINED,
              assignedVenueIds: [],
            },
          });
          await tx.profile.create({
            data: {
              userId: createdUser.id,
              fullName: deriveFullName(data.email),
            },
          });
          user = await tx.user.findUnique({
            where: { id: createdUser.id },
            include: { profile: true },
          });
        } else if (!user.profile) {
          await tx.profile.create({
            data: {
              userId: user.id,
              fullName: deriveFullName(user.email),
            },
          });
          user = await tx.user.findUnique({
            where: { id: user.id },
            include: { profile: true },
          });
        }

        if (!user) {
          throw new Error("Failed to create or retrieve user data");
        }

        const bookingCode = `BK-${bookingCodeGenerator()}`;

        const booking = await createBooking(
          {
            courtId: data.courtId,
            userId: user.id,
            orderId: null,
            bookingDate,
            bookingCode,
            duration: slots.length,
            totalPrice,
            timeSlots: slots,
            source: "ADMIN_MANUAL",
            status: BookingStatus.UPCOMING,
          },
          tx,
        );

        await createBlocking(
          booking.id,
          "Manual booking created from admin panel",
          tx,
        );

        return { booking, user };
      });

      const emailPayload = {
        email: data.email,
        customerName: result.user.profile?.fullName || data.email,
        court: court.name,
        venue: court.venue.name,
        date: bookingDate.toISOString(),
        startTime: slots[0].openHour,
        endTime: slots[slots.length - 1].closeHour,
        bookingCode: result.booking.bookingCode,
        loginUrl,
      };

      const emailResult =
        await resendService.sendManualBookingConfirmationEmail(emailPayload);

      if (!emailResult.success) {
        console.error(
          "Failed to send manual booking confirmation email:",
          emailResult.message,
        );
      }

      // Log activity for manual booking creation
      // Staff userId from context is recorded via context.actorUserId
      activityLogService.record({
        context,
        action: ACTION_TYPES.CREATE_MANUAL_BOOKING,
        entityType: ENTITY_TYPES.BOOKING,
        entityId: result.booking.id,
        entityReference: entityReferenceHelpers.booking({
          code: result.booking.bookingCode,
        }),
        changes: {
          before: {},
          after: {
            courtId: data.courtId,
            bookingDate: bookingDate.toISOString(),
            timeSlots: slots,
            customerEmail: data.email,
            bookingCode: result.booking.bookingCode,
            totalPrice,
          },
        },
      });

      // ============================================================================
      // Courtside Integration - Sync manual booking to external Courtside system
      // Requirements: 4.1, 4.2 - Manual bookings should sync to Courtside
      // ============================================================================
      await syncManualBookingToCourtside(
        {
          bookingId: result.booking.id,
          bookingCode: result.booking.bookingCode,
          courtId: data.courtId,
          bookingDate,
          timeSlots: slots,
          pricePerSlot: court.price,
        },
        context,
      );

      return {
        success: true,
        data: {
          bookingId: result.booking.id,
          bookingCode: result.booking.bookingCode,
          userId: result.user.id,
          totalPrice,
          timeSlots: slots,
        },
        message: "Manual booking created successfully",
      };
    } catch (error) {
      console.error("Manual booking service error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create manual booking",
      };
    }
  },
};
