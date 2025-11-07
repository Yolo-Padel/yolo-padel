// Transform Prisma booking data ke format Timetable
import type {
  Booking as TimetableBooking,
  Court as TimetableCourt,
} from "@/components/timetable-types";
import type { BookingDetail } from "@/app/admin/dashboard/booking/_components/booking-detail-modal";

// Type untuk Prisma booking result dari API
type PrismaBooking = {
  id: string;
  courtId: string;
  userId: string;
  bookingDate: string | Date;
  status: string;
  totalPrice: number;
  timeSlots: Array<{
    openHour: string;
    closeHour: string;
  }>;
  user: {
    profile: {
      fullName: string | null;
      avatar: string | null;
    } | null;
  };
  court: {
    id: string;
    name: string;
  };
  blocking?: {
    id: string;
    isBlocking: boolean;
  } | null;
  order?: {
    id: string;
    orderCode: string;
    status: string;
    totalAmount: number;
  } | null;
  payments?: Array<{
    id: string;
    amount: number;
    status: string;
    paymentDate: string | Date | null;
    channelName: string;
  }>;
};

// Type untuk Prisma court result dari API
type PrismaCourt = {
  id: string;
  name: string;
  operatingHours?: Array<{
    dayOfWeek: string;
    closed: boolean;
    slots: Array<{
      openHour: string;
      closeHour: string;
    }>;
  }>;
  venue?: {
    openHour: string;
    closeHour: string;
  };
};

/**
 * Transform Prisma booking ke format Timetable
 * HANYA tampilkan booking yang memiliki blocking aktif (isBlocking = true)
 * Booking tanpa blocking atau dengan isBlocking = false TIDAK akan ditampilkan
 */
export function transformPrismaBookingToTimetable(
  bookings: PrismaBooking[]
): TimetableBooking[] {
  return bookings
    .filter((booking) => {
      // STRICT FILTER: Hanya tampilkan booking yang:
      // 1. Memiliki record blocking (blocking !== null/undefined)
      // 2. isBlocking HARUS exactly === true
      const hasActiveBlocking =
        booking.blocking !== null &&
        booking.blocking !== undefined &&
        booking.blocking.isBlocking === true;

      return hasActiveBlocking;
    })
    .map((booking) => ({
      id: booking.id,
      courtId: booking.courtId,
      userId: booking.userId,
      userName: booking.user.profile?.fullName || "Unknown User",
      userAvatar: booking.user.profile?.avatar || undefined,
      bookingDate: new Date(booking.bookingDate),
      timeSlots: booking.timeSlots,
      status: booking.status as TimetableBooking["status"],
    }));
}

/**
 * Transform Prisma court ke format Timetable
 * Ekstrak operating hours untuk hari ini
 */
export function transformPrismaCourtToTimetable(
  courts: PrismaCourt[],
  selectedDate: Date = new Date()
): TimetableCourt[] {
  const dayOfWeek = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ][selectedDate.getDay()];

  return courts.map((court) => {
    // Cari operating hours untuk hari ini
    const todayOperatingHours = court.operatingHours?.find(
      (oh) => oh.dayOfWeek === dayOfWeek
    );

    // Default operating hours dari venue
    let openHour = court.venue?.openHour || "10:00";
    let closeHour = court.venue?.closeHour || "20:00";

    // Jika ada operating hours untuk hari ini dan tidak closed, gunakan slot pertama
    if (
      todayOperatingHours &&
      !todayOperatingHours.closed &&
      todayOperatingHours.slots.length > 0
    ) {
      openHour = todayOperatingHours.slots[0].openHour;
      closeHour =
        todayOperatingHours.slots[todayOperatingHours.slots.length - 1]
          .closeHour;
    }

    return {
      id: court.id,
      name: court.name,
      operatingHours: {
        openHour,
        closeHour,
      },
    };
  });
}

/**
 * Transform Prisma booking ke BookingDetail untuk modal
 */
export function transformPrismaBookingToDetail(
  booking: PrismaBooking,
  venueName: string,
  courtName: string
): BookingDetail {
  // Get payment info
  const payment =
    booking.payments && booking.payments.length > 0
      ? booking.payments[0]
      : null;

  return {
    id: booking.id,
    userName: booking.user.profile?.fullName || "Unknown User",
    venueName,
    courtName,
    bookingDate: new Date(booking.bookingDate),
    timeSlots: booking.timeSlots,
    duration: booking.timeSlots.length,
    totalAmount: booking.order?.totalAmount || booking.totalPrice || 0,
    paymentMethod: payment?.channelName || "N/A",
    paymentStatus:
      (payment?.status as BookingDetail["paymentStatus"]) || "PENDING",
    createdAt: payment?.paymentDate
      ? new Date(payment.paymentDate)
      : new Date(booking.bookingDate),
  };
}
