import type { Booking } from "./timetable-types";
import type { BookingDetail } from "../app/admin/dashboard/timetable/_components/booking-detail-modal";
import { PaymentStatus } from "@/types/prisma";

// Helper untuk transform Booking ke BookingDetail dengan data lengkap
// Untuk preview/dummy data, kita bisa menambahkan payment info secara manual
export function createBookingDetailTransform(
  paymentInfoMap: Map<
    string,
    {
      totalAmount: number;
      paymentMethod: string;
      paymentStatus: PaymentStatus;
      createdAt: Date;
    }
  >
) {
  return (
    booking: Booking,
    venueName: string,
    courtName: string
  ): BookingDetail => {
    const paymentInfo = paymentInfoMap.get(booking.id) || {
      totalAmount: 600000, // Default Rp600.000
      paymentMethod: "QRIS",
      paymentStatus: "PAID" as const,
      createdAt: booking.bookingDate,
    };

    return {
      id: booking.id,
      bookingCode: booking.bookingCode,
      source: booking.source,
      userName: booking.userName,
      venueName,
      courtName,
      bookingDate: booking.bookingDate,
      timeSlots: booking.timeSlots,
      duration: booking.timeSlots.length,
      totalAmount: paymentInfo.totalAmount,
      paymentMethod: paymentInfo.paymentMethod,
      paymentStatus: paymentInfo.paymentStatus,
      createdAt: paymentInfo.createdAt,
    };
  };
}
