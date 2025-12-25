"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { TimetableContainer } from "./timetable-container";
import { TimetableSkeleton } from "./timetable-skeleton";
import { TimetableHeaderSkeleton } from "./timetable-header-skeleton";
import { TimetableTableSkeleton } from "./timetable-table-skeleton";
import { TimetableError } from "./timetable-error";
import { ErrorBoundary } from "@/components/error-boundary";
import { TimetableEmptyState } from "@/components/timetable-empty-state";
import { useVenue } from "@/hooks/use-venue";
import { useCourtByVenue } from "@/hooks/use-court";
import { useBlockingByVenueAndDate } from "@/hooks/use-blocking";
import { useCourtsideBlockingsByVenue } from "@/hooks/use-courtside";
import {
  transformPrismaBlockingToTimetable,
  transformPrismaCourtToTimetable,
  transformPrismaBlockingToDetail,
} from "@/lib/booking-transform";
import type { Venue, Booking } from "@/components/timetable-types";
import { BookingStatus, PaymentStatus } from "@/types/prisma";
import { TimetableHeader } from "./timetable-header";
import { getNextHour } from "@/components/timetable-utils";
import {
  ManualBookingDefaults,
  ManualBookingSheet,
} from "@/app/admin/dashboard/_components/manual-booking-sheet";
import { usePermissionGuard } from "@/hooks/use-permission-guard";
import { useUpdateBookingStatus } from "@/hooks/use-booking";

export function TimetableContent() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetDefaults, setSheetDefaults] = useState<
    ManualBookingDefaults | undefined
  >(undefined);

  // Track previous values to detect changes
  const prevVenueIdRef = useRef<string>("");
  const prevDateRef = useRef<Date | null>(null);
  const isFirstRenderRef = useRef(true);

  const { canAccess: canCreateBooking, isLoading: isCreateLoading } =
    usePermissionGuard({
      moduleKey: "bookings",
      action: "create",
    });

  // Fetch venues
  const {
    data: venuesData,
    isLoading: venuesLoading,
    isError: venuesError,
    error: venuesErrorData,
    refetch: refetchVenues,
  } = useVenue();

  // Fetch courts by venue
  const {
    data: courtsData,
    isLoading: courtsLoading,
    isError: courtsError,
    error: courtsErrorData,
    refetch: refetchCourts,
  } = useCourtByVenue(selectedVenueId);

  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fetch blockings by venue and date
  // Normalize date to prevent multiple fetches from time differences
  const normalizedDate = useMemo(() => {
    const d = new Date(selectedDate);
    console.log("NORMALIZED DATE", formatDateToString(d));
    return formatDateToString(d);
  }, [selectedDate]);

  const {
    data: blockingsData,
    isLoading: blockingsLoading,
    isError: blockingsError,
    error: blockingsErrorData,
    refetch: refetchBlockings,
  } = useBlockingByVenueAndDate(selectedVenueId, normalizedDate);

  // Fetch courtside blockings for the venue
  const {
    data: courtsideBlockingsData,
    isLoading: courtsideBlockingsLoading,
    refetch: refetchCourtsideBlockings,
  } = useCourtsideBlockingsByVenue({
    venueId: selectedVenueId,
    bookingDate: normalizedDate,
  });

  const { mutate: updateBookingStatusMutation } = useUpdateBookingStatus();

  // Transform venues data
  const venues: Venue[] = useMemo(() => {
    if (!venuesData?.data) return [];
    return venuesData.data.map((venue: any) => ({
      id: venue.id,
      name: venue.name,
    }));
  }, [venuesData]);

  // Auto-select first venue if not selected
  useMemo(() => {
    if (venues.length > 0 && !selectedVenueId) {
      setSelectedVenueId(venues[0].id);
    }
  }, [venues, selectedVenueId]);

  // Transform courts data
  const courts = useMemo(() => {
    if (!courtsData?.data) return [];
    return transformPrismaCourtToTimetable(courtsData.data, normalizedDate);
  }, [courtsData, normalizedDate]);

  // Transform blockings data (internal + courtside)
  const bookings: Booking[] = useMemo(() => {
    const internalBookings = blockingsData
      ? transformPrismaBlockingToTimetable(blockingsData)
      : [];

    // Transform courtside blockings to timetable format
    const courtsideBookings: Booking[] = courtsideBlockingsData
      ? courtsideBlockingsData.map((blocking) => ({
          id: blocking.id,
          courtId: blocking.booking.courtId,
          userId: "", // Courtside bookings don't have internal userId
          bookingCode: `CS-${blocking.bookingId}`,
          status: "COMPLETED" as BookingStatus,
          source: "COURTSIDE",
          userName: "Courtside Booking",
          bookingDate: new Date(blocking.booking.bookingDate),
          timeSlots: blocking.booking.timeSlots.map((slot) => ({
            openHour: slot.openHour,
            closeHour: slot.closeHour,
          })),
        }))
      : [];

    return [...internalBookings, ...courtsideBookings];
  }, [blockingsData, courtsideBlockingsData]);

  // Get selected venue name
  const selectedVenue = venues.find((v) => v.id === selectedVenueId);
  const venueName = selectedVenue?.name || "";

  // Transform function for booking detail modal
  const transformBooking = useMemo(() => {
    return (booking: any, venueName: string, courtName: string) => {
      // Find the full blocking data from API
      const fullBlocking = blockingsData?.find(
        (b: any) => b.booking.id === booking.id,
      );
      if (fullBlocking) {
        return transformPrismaBlockingToDetail(fullBlocking, venueName);
      }
      // Fallback to basic transform
      return {
        id: booking.id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        source: booking.source,
        userName: booking.userName,
        venueName,
        courtName,
        bookingDate: booking.bookingDate,
        timeSlots: booking.timeSlots,
        duration: booking.timeSlots.length,
        totalAmount: 0,
        paymentMethod: "N/A",
        paymentStatus: PaymentStatus.UNPAID,
        createdAt: booking.bookingDate,
      };
    };
  }, [blockingsData]);

  // Handle venue change
  const handleVenueChange = (venueId: string) => {
    setSelectedVenueId(venueId);
  };

  // Handle date change
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const openManualBookingSheet = (defaults: ManualBookingDefaults) => {
    setSheetDefaults(defaults);
    setSheetOpen(true);
  };

  const handleAddBooking = () => {
    if (!selectedVenueId) return;
    openManualBookingSheet({
      venueId: selectedVenueId,
      date: selectedDate,
    });
  };

  const handleAddBookingFromCell = (options: {
    courtId: string;
    startTime: string;
    endTime?: string;
  }) => {
    if (!selectedVenueId) return;
    openManualBookingSheet({
      venueId: selectedVenueId,
      courtId: options.courtId,
      date: selectedDate,
      startTime: options.startTime,
      endTime: options.endTime || getNextHour(options.startTime),
    });
  };

  // Handle mark as complete
  const handleMarkAsComplete = (bookingId: string) => {
    updateBookingStatusMutation({
      id: bookingId,
      status: BookingStatus.COMPLETED,
    });
  };

  const handleMarkAsNoShow = (bookingId: string) => {
    updateBookingStatusMutation({
      id: bookingId,
      status: BookingStatus.NO_SHOW,
    });
  };

  // Detect what changed to determine loading UI
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      prevVenueIdRef.current = selectedVenueId;
      prevDateRef.current = selectedDate;
      return;
    }

    // Update refs after render
    prevVenueIdRef.current = selectedVenueId;
    prevDateRef.current = selectedDate;
  }, [selectedVenueId, selectedDate]);

  const venueChanged =
    !isFirstRenderRef.current &&
    prevVenueIdRef.current !== selectedVenueId &&
    prevVenueIdRef.current !== "";

  const dateChanged =
    !isFirstRenderRef.current &&
    prevDateRef.current !== null &&
    prevDateRef.current.toDateString() !== selectedDate.toDateString();

  // Determine loading states
  const isInitialLoad =
    venuesLoading ||
    (isFirstRenderRef.current &&
      (courtsLoading || blockingsLoading || courtsideBlockingsLoading));
  const isVenueChangeLoading =
    venueChanged &&
    (courtsLoading || blockingsLoading || courtsideBlockingsLoading);
  const isDateChangeLoading =
    dateChanged && (blockingsLoading || courtsideBlockingsLoading);

  // Handle errors
  if (venuesError) {
    return (
      <TimetableError
        error={venuesErrorData as Error}
        onRetry={refetchVenues}
      />
    );
  }

  if (courtsError && !courtsLoading) {
    return (
      <TimetableError
        error={courtsErrorData as Error}
        onRetry={refetchCourts}
      />
    );
  }

  if (blockingsError && !blockingsLoading) {
    return (
      <TimetableError
        error={blockingsErrorData as Error}
        onRetry={refetchBlockings}
      />
    );
  }

  // Show full skeleton for initial load
  if (isInitialLoad) {
    return <TimetableSkeleton />;
  }

  // Show header skeleton + table skeleton for venue change
  if (isVenueChangeLoading) {
    return (
      <div className="space-y-4 w-full max-w-full">
        <TimetableHeaderSkeleton showVenueSelector={false} />
        <TimetableTableSkeleton />
      </div>
    );
  }

  // Show empty state if no venues
  if (venues.length === 0 && !venuesLoading) {
    return (
      <ErrorBoundary>
        <div className="space-y-6 w-full">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">Booking Time Table</h2>
            </div>
          </div>
          <TimetableEmptyState type="no-venues" />
        </div>
      </ErrorBoundary>
    );
  }

  // Show empty state if no courts for selected venue
  if (courts.length === 0 && !courtsLoading && selectedVenueId) {
    return (
      <ErrorBoundary>
        <div className="space-y-6 w-full">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">Booking Time Table</h2>
            </div>
          </div>
          <TimetableHeader
            venues={venues}
            selectedVenueId={selectedVenueId}
            onVenueChange={handleVenueChange}
            onAddBooking={handleAddBooking}
            isLoading={courtsLoading}
            canCreateBooking={canCreateBooking}
            isLoadingPermission={isCreateLoading}
          />
          <TimetableEmptyState type="no-courts" />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <>
      <ErrorBoundary>
        <div className="space-y-6 w-full">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">Booking Time Table</h2>
            </div>
          </div>
          <TimetableContainer
            venues={venues}
            selectedVenueId={selectedVenueId}
            onVenueChange={handleVenueChange}
            courts={courts}
            bookings={bookings}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            transformBookingToDetail={transformBooking}
            onMarkAsComplete={handleMarkAsComplete}
            onMarkAsNoShow={handleMarkAsNoShow}
            isLoadingTable={isDateChangeLoading}
            onAddBooking={handleAddBooking}
            onSelectEmptySlot={handleAddBookingFromCell}
            onRefresh={() => {
              refetchBlockings();
              refetchCourtsideBlockings();
            }}
            canCreateBooking={canCreateBooking}
            isLoadingPermission={isCreateLoading}
          />
        </div>
      </ErrorBoundary>
      <ManualBookingSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        defaults={sheetDefaults}
        onSuccess={() => {
          refetchBlockings();
          refetchCourtsideBlockings();
        }}
      />
    </>
  );
}
