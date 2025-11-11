"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { TimetableContainer } from "./timetable-container";
import { TimetableSkeleton } from "./timetable-skeleton";
import { TimetableHeaderSkeleton } from "./timetable-header-skeleton";
import { TimetableTableSkeleton } from "./timetable-table-skeleton";
import { TimetableError } from "./timetable-error";
import { ErrorBoundary } from "@/components/error-boundary";
import { useVenue } from "@/hooks/use-venue";
import { useCourtByVenue } from "@/hooks/use-court";
import { useBlockingByVenueAndDate } from "@/hooks/use-blocking";
import {
  transformPrismaBlockingToTimetable,
  transformPrismaCourtToTimetable,
  transformPrismaBlockingToDetail,
} from "@/lib/booking-transform";
import type { Venue } from "@/components/timetable-types";

export function TimetableContent() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");

  // Track previous values to detect changes
  const prevVenueIdRef = useRef<string>("");
  const prevDateRef = useRef<Date | null>(null);
  const isFirstRenderRef = useRef(true);

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

  // Fetch blockings by venue and date
  // Normalize date to prevent multiple fetches from time differences
  const normalizedDate = useMemo(() => {
    const d = new Date(selectedDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [selectedDate]);

  const {
    data: blockingsData,
    isLoading: blockingsLoading,
    isError: blockingsError,
    error: blockingsErrorData,
    refetch: refetchBlockings,
  } = useBlockingByVenueAndDate(selectedVenueId, normalizedDate);

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

  // Transform blockings data
  const bookings = useMemo(() => {
    if (!blockingsData) return [];
    return transformPrismaBlockingToTimetable(blockingsData);
  }, [blockingsData]);

  // Get selected venue name
  const selectedVenue = venues.find((v) => v.id === selectedVenueId);
  const venueName = selectedVenue?.name || "";

  // Transform function for booking detail modal
  const transformBooking = useMemo(() => {
    return (booking: any, venueName: string, courtName: string) => {
      // Find the full blocking data from API
      const fullBlocking = blockingsData?.find(
        (b: any) => b.booking.id === booking.id
      );
      if (fullBlocking) {
        return transformPrismaBlockingToDetail(fullBlocking, venueName);
      }
      // Fallback to basic transform
      return {
        id: booking.id,
        userName: booking.userName,
        venueName,
        courtName,
        bookingDate: booking.bookingDate,
        timeSlots: booking.timeSlots,
        duration: booking.timeSlots.length,
        totalAmount: 0,
        paymentMethod: "N/A",
        paymentStatus: "PENDING" as const,
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

  // Handle mark as complete
  const handleMarkAsComplete = (bookingId: string) => {
    // TODO: Implement mark as complete functionality
    console.log("Mark as complete:", bookingId);
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
    (isFirstRenderRef.current && (courtsLoading || blockingsLoading));
  const isVenueChangeLoading =
    venueChanged && (courtsLoading || blockingsLoading);
  const isDateChangeLoading = dateChanged && blockingsLoading;

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

  return (
    <ErrorBoundary>
      <div className="space-y-6 w-full">
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
          isLoadingTable={isDateChangeLoading}
        />
      </div>
    </ErrorBoundary>
  );
}

