"use client";

import { useMemo } from "react";
import { Timetable } from "./_components/timetable";
import { dummyCourts, dummyBookings } from "@/components/timetable-dummy-data";
import { createBookingDetailTransform } from "@/components/timetable-transform-helpers";

export default function AdminBookingPage() {
  // Create payment info map untuk dummy data
  const paymentInfoMap = useMemo(() => {
    const map = new Map();

    // Set payment info untuk setiap booking
    dummyBookings.forEach((booking) => {
      map.set(booking.id, {
        totalAmount: 600000, // Rp600.000
        paymentMethod: "QRIS",
        paymentStatus: "PAID" as const,
        createdAt: new Date(booking.bookingDate.getTime() + 8 * 60 * 60 * 1000), // 8 jam setelah booking date
      });
    });

    return map;
  }, []);

  const transformBooking = useMemo(
    () => createBookingDetailTransform(paymentInfoMap),
    [paymentInfoMap]
  );

  // Handle mark as complete
  const handleMarkAsComplete = (bookingId: string) => {
    // TODO: Implement mark as complete functionality
    console.log("Mark as complete:", bookingId);
  };

  return (
    <div className="space-y-6 min-w-0">
      <Timetable
        venueName="Slipi Padel Center"
        courts={dummyCourts}
        bookings={dummyBookings}
        transformBookingToDetail={transformBooking}
        onMarkAsComplete={handleMarkAsComplete}
      />
    </div>
  );
}
