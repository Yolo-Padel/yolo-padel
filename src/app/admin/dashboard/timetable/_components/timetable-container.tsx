"use client";

import * as React from "react";
import { BookingDetailModal, BookingDetail } from "./booking-detail-modal";
import { TimetableHeader } from "./timetable-header";
import { Timetable } from "./timetable";
import { TimetableBookingCell } from "./timetable-booking-cell";
import type {
  TimetableProps,
  Booking,
  TimetableRenderCell,
  Court,
} from "@/components/timetable-types";
import { getTimeSlotBooking } from "@/components/timetable-booking-helpers";
import { getNextHour } from "@/components/timetable-utils";
import { CancelBookingModal } from "./booking-cancel";
import { useCancelBooking } from "@/hooks/use-booking";
import { ConfirmCompleteBookingModal } from "./confirm-complete-booking-modal";
import { ConfirmNoShowBookingModal } from "./confirm-no-show-booking-modal";

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
  courtName: string,
): BookingDetail {
  return {
    id: booking.id,
    status: booking.status,
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
    bookingCode: booking.bookingCode,
    source: booking.source,
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
  onMarkAsNoShow,
  onCancelBooking,
  isLoadingTable = false,
  onAddBooking,
  onSelectEmptySlot,
  onRefresh,
  canCreateBooking = false,
  isLoadingPermission = false,
}: TimetableProps & {
  onAddBooking?: () => void;
  onSelectEmptySlot?: (payload: {
    courtId: string;
    startTime: string;
    endTime?: string;
  }) => void;
  onRefresh?: () => void;
  canCreateBooking: boolean;
  isLoadingPermission: boolean;
}) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    initialDate || new Date(),
  );
  const [selectedBooking, setSelectedBooking] =
    React.useState<BookingDetail | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = React.useState(false);
  const [confirmNoShowModalOpen, setConfirmNoShowModalOpen] =
    React.useState(false);
  const [dragState, setDragState] = React.useState<{
    court: Court;
    startSlot: string;
    lastSlot: string;
  } | null>(null);

  // Cancel booking hook
  const cancelBookingMutation = useCancelBooking();

  // Get selected venue name for modal display
  const selectedVenue = venues.find((v) => v.id === selectedVenueId);
  const venueName = selectedVenue?.name || "";

  // Handle cell click - open booking detail modal
  const handleCellClick = React.useCallback(
    (booking: Booking | null, courtName: string) => {
      if (!booking) return;

      const bookingDetail = transformBookingToDetail(
        booking,
        venueName,
        courtName,
      );
      setSelectedBooking(bookingDetail);
      setModalOpen(true);
      setCancelModalOpen(false);
    },
    [transformBookingToDetail, venueName],
  );

  // Handle mark booking as complete
  const handleMarkAsComplete = () => {
    if (selectedBooking) {
      onMarkAsComplete?.(selectedBooking.id);
      setConfirmModalOpen(false);
      setSelectedBooking(null);
    }
  };

  const handleMarkAsNoShow = () => {
    if (selectedBooking) {
      onMarkAsNoShow?.(selectedBooking.id);
      setConfirmNoShowModalOpen(false);
      setSelectedBooking(null);
    }
  };

  // Handle Cancel booking
  const handleOpenCancelBookingModal = () => {
    if (selectedBooking) {
      setCancelModalOpen(true);
    }
  };

  // Handle Confirm booking
  const handleOpenConfirmBookingModal = () => {
    if (selectedBooking) {
      setModalOpen(false);
      setConfirmModalOpen(true);
    }
  };

  const handleCloseConfirmBookingModal = () => {
    if (selectedBooking) {
      setConfirmModalOpen(false);
      setModalOpen(true);
    }
  };

  const handleOpenConfirmNoShowBookingModal = () => {
    if (selectedBooking) {
      setModalOpen(false);
      setConfirmNoShowModalOpen(true);
    }
  };

  const handleCloseConfirmNoShowBookingModal = () => {
    if (selectedBooking) {
      setConfirmNoShowModalOpen(false);
      setModalOpen(true);
    }
  };

  const handleCancelBooking = () => {
    if (selectedBooking) {
      cancelBookingMutation.mutate(selectedBooking.id, {
        onSuccess: () => {
          setCancelModalOpen(false);
          setModalOpen(false);
          setSelectedBooking(null);
          onCancelBooking?.(selectedBooking.id);
        },
      });
    }
  };

  const handleCloseCancelBookingModal = () => {
    setCancelModalOpen(false);
    setSelectedBooking(null);
  };

  // Handle date change from header
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    onDateChange?.(date);
  };

  const handleCellInteraction = React.useCallback(
    ({
      booking,
      court,
      timeSlot,
    }: {
      booking: Booking | null;
      court: Court;
      timeSlot: string;
    }) => {
      if (booking) {
        handleCellClick(booking, court.name);
        return;
      }

      onSelectEmptySlot?.({
        courtId: court.id,
        startTime: timeSlot,
        endTime: getNextHour(timeSlot),
      });
    },
    [handleCellClick, onSelectEmptySlot],
  );

  const renderBookingCell = React.useCallback<TimetableRenderCell>(
    ({ court, timeSlot, timeIndex, timeSlots, selectedDate }) => {
      const bookingInfo = getTimeSlotBooking(
        timeSlot,
        timeIndex,
        court.id,
        bookings ?? [],
        selectedDate,
        timeSlots,
      );

      const isFirstSlot = bookingInfo?.isFirstSlot ?? false;
      const span = bookingInfo?.span ?? 1;
      const booking = bookingInfo?.booking ?? null;

      // Check if this cell is part of the drag preview
      const isDragPreview =
        dragState !== null && dragState.court.id === court.id && !booking;

      let isInDragRange = false;
      if (isDragPreview) {
        const sortedSlots = [dragState.startSlot, dragState.lastSlot].sort();
        isInDragRange =
          timeSlot >= sortedSlots[0] && timeSlot <= sortedSlots[1];
      }

      return (
        <TimetableBookingCell
          court={court}
          timeSlot={timeSlot}
          booking={booking}
          isFirstSlot={isFirstSlot}
          span={span}
          selectedDate={selectedDate}
          isDragPreview={isDragPreview && isInDragRange}
          canCreateBooking={canCreateBooking}
          isLoadingPermission={isLoadingPermission}
          onClick={({
            booking: selectedBooking,
            court: selectedCourt,
            timeSlot: slot,
          }) => {
            // Don't trigger onClick if we're in drag mode
            if (!dragState) {
              console.log("SELECTED BOOKING", selectedBooking);
              handleCellInteraction({
                booking: selectedBooking,
                court: selectedCourt,
                timeSlot: slot,
              });
            }
          }}
          onMouseDown={(cellCourt, slot) => {
            // Only allow dragging on empty cells
            if (!booking) {
              setDragState({
                court: cellCourt,
                startSlot: slot,
                lastSlot: slot,
              });
            }
          }}
          onMouseEnter={(cellCourt, slot) => {
            // Update drag state if we're dragging on the same court
            if (dragState && dragState.court.id === cellCourt.id && !booking) {
              setDragState((prev) => {
                if (!prev || prev.court.id !== cellCourt.id) return prev;
                return { ...prev, lastSlot: slot };
              });
            }
          }}
        />
      );
    },
    [bookings, handleCellInteraction, dragState],
  );

  // Handle mouse up to complete drag and open booking sheet
  React.useEffect(() => {
    if (!dragState) return;

    const handleMouseUp = () => {
      setDragState((current) => {
        if (!current) return null;

        // Sort slots to get start and end
        const sortedSlots = [current.startSlot, current.lastSlot].sort();
        const startTime = sortedSlots[0];
        const endTime = getNextHour(sortedSlots[sortedSlots.length - 1]);

        // Use setTimeout to ensure this runs after render cycle completes
        // This prevents "Cannot update a component while rendering a different component" error
        setTimeout(() => {
          onSelectEmptySlot?.({
            courtId: current.court.id,
            startTime,
            endTime,
          });
        }, 0);

        return null;
      });
    };

    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, onSelectEmptySlot]);

  return (
    <div className="space-y-4 w-full max-w-full">
      {/* Header: Venue Selector */}
      <TimetableHeader
        venues={venues}
        selectedVenueId={selectedVenueId}
        onVenueChange={onVenueChange}
        onAddBooking={onAddBooking}
        isLoading={isLoadingTable}
        canCreateBooking={canCreateBooking}
        isLoadingPermission={isLoadingPermission}
      />

      {/* Table: Courts x Time Slots Grid */}
      <Timetable
        courts={courts}
        selectedDate={selectedDate}
        isLoading={isLoadingTable}
        onDateChange={handleDateChange}
        onRefresh={onRefresh}
        renderCell={renderBookingCell}
      />

      {/* Modal: Booking Detail */}
      <BookingDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        booking={selectedBooking}
        onConfirmMarkAsCompleteBooking={handleOpenConfirmBookingModal}
        onConfirmMarkAsNoShowBooking={handleOpenConfirmNoShowBookingModal}
      />

      <CancelBookingModal
        open={cancelModalOpen}
        onOpenChange={handleCloseCancelBookingModal}
        booking={selectedBooking}
        onCancelBooking={handleCancelBooking}
        isLoading={cancelBookingMutation.isPending}
      />

      <ConfirmCompleteBookingModal
        open={confirmModalOpen}
        onOpenChange={handleCloseConfirmBookingModal}
        onCompleteBooking={handleMarkAsComplete}
      />

      <ConfirmNoShowBookingModal
        open={confirmNoShowModalOpen}
        onOpenChange={handleCloseConfirmNoShowBookingModal}
        onMarkBookingAsNoShow={handleMarkAsNoShow}
      />
    </div>
  );
}
