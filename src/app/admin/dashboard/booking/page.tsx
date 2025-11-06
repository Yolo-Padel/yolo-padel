"use client";

import { useState, useMemo } from "react";
import { Timetable } from "./_components/timetable";
import { useVenue } from "@/hooks/use-venue";
import { useCourtByVenue } from "@/hooks/use-court";
import { useBookingByVenueAndDate } from "@/hooks/use-booking";
import {
  transformPrismaBookingToTimetable,
  transformPrismaCourtToTimetable,
  transformPrismaBookingToDetail,
} from "@/lib/booking-transform";
import type { Venue } from "@/components/timetable-types";

export default function AdminBookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");

  // Fetch venues
  const { data: venuesData, isLoading: venuesLoading } = useVenue();

  // Fetch courts by venue
  const { data: courtsData, isLoading: courtsLoading } =
    useCourtByVenue(selectedVenueId);

  // Fetch bookings by venue and date
  // Normalize date to prevent multiple fetches from time differences
  const normalizedDate = useMemo(() => {
    const d = new Date(selectedDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [selectedDate]);

  const { data: bookingsData, isLoading: bookingsLoading } =
    useBookingByVenueAndDate(selectedVenueId, normalizedDate);

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

  // Transform bookings data
  const bookings = useMemo(() => {
    if (!bookingsData?.data) return [];
    return transformPrismaBookingToTimetable(bookingsData.data);
  }, [bookingsData]);

  // Get selected venue name
  const selectedVenue = venues.find((v) => v.id === selectedVenueId);
  const venueName = selectedVenue?.name || "";

  // Transform function for booking detail modal
  const transformBooking = useMemo(() => {
    return (booking: any, venueName: string, courtName: string) => {
      // Find the full booking data from API
      const fullBooking = bookingsData?.data?.find(
        (b: any) => b.id === booking.id
      );
      if (fullBooking) {
        return transformPrismaBookingToDetail(
          fullBooking,
          venueName,
          courtName
        );
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
  }, [bookingsData]);

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

  // Show loading state
  if (venuesLoading) {
    return (
      <div className="space-y-6 w-full max-w-full">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Memuat data venue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <Timetable
        venues={venues}
        selectedVenueId={selectedVenueId}
        onVenueChange={handleVenueChange}
        courts={courts}
        bookings={bookings}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        transformBookingToDetail={transformBooking}
        onMarkAsComplete={handleMarkAsComplete}
      />
      {(courtsLoading || bookingsLoading) && (
        <div className="text-sm text-muted-foreground">
          Memuat data bookings...
        </div>
      )}
    </div>
  );
}
