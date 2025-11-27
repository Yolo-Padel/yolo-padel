import { prisma } from "@/lib/prisma";
import { ManualBookingInput } from "@/lib/validations/manual-booking.validation";
import { bookingService, createBooking } from "@/lib/services/booking.service";
import { createBlocking } from "@/lib/services/blocking.service";
import { resendService } from "@/lib/services/resend.service";
import { calculateSlotsPrice } from "@/lib/booking-pricing-utils";
import { ServiceContext, requirePermission } from "@/types/service-context";
import { BookingStatus, UserType, UserStatus } from "@/types/prisma";
import { customAlphabet } from "nanoid";

type TimeSlot = { openHour: string; closeHour: string };

const bookingCodeGenerator = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  5
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
          message: "Rentang waktu yang dipilih tidak valid",
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
          message: "Court tidak ditemukan atau sudah tidak aktif",
        };
      }

      if (court.venueId !== data.venueId) {
        return {
          success: false,
          data: null,
          message: "Venue tidak sesuai dengan court yang dipilih",
        };
      }

      const bookingDate = parseBookingDate(data.date);
      const availability = await bookingService.checkAvailability(
        data.courtId,
        bookingDate,
        slots
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
          message: "Slot waktu sudah terisi, pilih jam lainnya",
        };
      }

      const uiSlots = slots.map(toUiSlot);
      const { totalPrice } = calculateSlotsPrice(
        uiSlots,
        bookingDate,
        court.price,
        court.dynamicPrices || []
      );

      const loginUrl = getLoginUrl();

      const result = await prisma.$transaction(async (tx) => {
        let user = await tx.user.findUnique({
          where: { email: data.email },
          include: { profile: true },
        });

        if (user?.isArchived) {
          throw new Error(
            "Email tersebut terarsip dan tidak bisa digunakan untuk booking manual"
          );
        }

        if (!user) {
          const createdUser = await tx.user.create({
            data: {
              email: data.email,
              password: "",
              userType: UserType.USER,
              userStatus: UserStatus.ACTIVE,
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
          throw new Error("Gagal membuat atau mengambil data user");
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
          tx
        );

        await createBlocking(
          booking.id,
          "Manual booking created from admin panel",
          tx
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
          emailResult.message
        );
      }

      return {
        success: true,
        data: {
          bookingId: result.booking.id,
          bookingCode: result.booking.bookingCode,
          userId: result.user.id,
          totalPrice,
          timeSlots: slots,
        },
        message: "Manual booking berhasil dibuat",
      };
    } catch (error) {
      console.error("Manual booking service error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Gagal membuat manual booking",
      };
    }
  },
};
