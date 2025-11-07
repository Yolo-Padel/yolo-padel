"use client";

import * as React from "react";
import { BookingDetailModal, BookingDetail } from "./booking-detail-modal";
import { TimetableHeader } from "./timetable-header";
import { Timetable } from "./timetable";
import type { TimetableProps, Booking } from "@/components/timetable-types";

// Re-export types untuk backward compatibility
export type {
  Court,
  Booking,
  Venue,
  TimetableProps,
} from "@/components/timetable-types";

/**
 * Default transform function untuk convert Booking ke BookingDetail
 * Used as fallback when transformBookingToDetail prop is not provided
 */
function defaultTransformBookingToDetail(
  booking: Booking,
  venueName: string,
  courtName: string
): BookingDetail {
  return {
    id: booking.id,
    userName: booking.userName,
    venueName,
    courtName,
    bookingDate: booking.bookingDate,
    timeSlots: booking.timeSlots,
    duration: booking.timeSlots.length,
    totalAmount: 0,
    paymentMethod: "QRIS",
    paymentStatus: "PAID",
    createdAt: booking.bookingDate,
  };
}

/**
 * Timetable Component
 * Main component for displaying venue booking schedule in a time-grid format
 *
 * Features:
 * - Venue selection dropdown
 * - Date navigation (prev/next, calendar, shortcuts)
 * - Grid view of courts x time slots
 * - Visual booking blocks with user info
 * - Click to view booking details
 * - Loading states with skeleton
 */
export function TimetableContainer({
  venues = [],
  selectedVenueId,
  onVenueChange,
  courts = [],
  bookings = [],
  selectedDate: initialDate,
  onDateChange,
  transformBookingToDetail = defaultTransformBookingToDetail,
  onMarkAsComplete,
  isLoadingTable = false,
}: TimetableProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    initialDate || new Date()
  );
  const [selectedBooking, setSelectedBooking] =
    React.useState<BookingDetail | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  // Get selected venue name for modal display
  const selectedVenue = venues.find((v) => v.id === selectedVenueId);
  const venueName = selectedVenue?.name || "";

  // Handle cell click - open booking detail modal
  const handleCellClick = (booking: Booking | null, courtName: string) => {
    if (!booking) return;

    const bookingDetail = transformBookingToDetail(
      booking,
      venueName,
      courtName
    );
    setSelectedBooking(bookingDetail);
    setModalOpen(true);
  };

  // Handle mark booking as complete
  const handleMarkAsComplete = () => {
    if (selectedBooking) {
      onMarkAsComplete?.(selectedBooking.id);
      setModalOpen(false);
      setSelectedBooking(null);
    }
  };

  // Handle date change from header
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    onDateChange?.(date);
  };

  return (
    <div className="space-y-4 w-full max-w-full">
      {/* Header: Venue Selector + Date Navigation */}
      <TimetableHeader
        venues={venues}
        selectedVenueId={selectedVenueId}
        onVenueChange={onVenueChange}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        isLoading={isLoadingTable}
      />

      {/* Table: Courts x Time Slots Grid */}
      <Timetable
        courts={courts}
        bookings={bookings}
        selectedDate={selectedDate}
        isLoading={isLoadingTable}
        onCellClick={handleCellClick}
      />

      {/* Modal: Booking Detail */}
      <BookingDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        booking={selectedBooking}
        onMarkAsComplete={handleMarkAsComplete}
      />
    </div>
  );
}
