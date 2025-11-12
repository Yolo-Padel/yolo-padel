"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, CalendarIcon, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { BookingDetailModal, BookingDetail } from "./booking-detail-modal";
import type { TimetableProps, Booking } from "@/components/timetable-types";
import {
  generateTimeSlots,
  formatTimeDisplay,
  formatTimeRange,
  formatOperatingHours,
} from "@/components/timetable-utils";
import { getTimeSlotBooking } from "@/components/timetable-booking-helpers";

// Re-export types untuk backward compatibility
export type {
  Court,
  Booking,
  Venue,
  TimetableProps,
} from "@/components/timetable-types";

// Default transform function untuk convert Booking ke BookingDetail
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
    duration: booking.timeSlots.length, // Assuming 1 hour per slot
    totalAmount: 0, // Will be provided by actual data
    paymentMethod: "QRIS", // Default
    paymentStatus: "PAID", // Default
    createdAt: booking.bookingDate, // Default
  };
}

export function Timetable({
  venues = [],
  selectedVenueId,
  onVenueChange,
  courts = [],
  bookings = [],
  selectedDate: initialDate,
  onDateChange,
  transformBookingToDetail = defaultTransformBookingToDetail,
  onMarkAsComplete,
}: TimetableProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    initialDate || new Date()
  );
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [selectedBooking, setSelectedBooking] =
    React.useState<BookingDetail | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const timeSlots = React.useMemo(() => generateTimeSlots(), []);

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    onDateChange?.(date);
  };

  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    handleDateChange(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    handleDateChange(next);
  };

  const goToToday = () => {
    handleDateChange(new Date());
  };

  const goToTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    handleDateChange(tomorrow);
  };

  // Get selected venue name
  const selectedVenue = venues.find((v) => v.id === selectedVenueId);
  const venueName = selectedVenue?.name || "";

  // Handle cell click
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

  // Handle mark as complete
  const handleMarkAsComplete = () => {
    if (selectedBooking) {
      onMarkAsComplete?.(selectedBooking.id);
      setModalOpen(false);
      setSelectedBooking(null);
    }
  };

  // Format tanggal untuk display: "Mon, 14 Okt"
  const formattedDate = format(selectedDate, "EEE, d MMM", { locale: id });

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-semibold">Time Table</h2>
        <Badge className="text-[#6941C6] bg-[#F9F5FF] border-[#E9D7FE] shadow-none rounded-4xl">
          10 bookings
        </Badge>
      </div>
      {/* Header */}
      <div className="flex flex-col gap-4 w-full max-w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full max-w-full">
          {/* Date Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousDay}
              className="border-[#C3D223]"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#C3D223] gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formattedDate}</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      handleDateChange(date);
                      setCalendarOpen(false);
                    }
                  }}
                  locale={id}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextDay}
              className="border-[#C3D223]"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="border-[#C3D223]"
            >
              Go to Today
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToTomorrow}
              className="border-[#C3D223]"
            >
              Tomorrow
            </Button>
          </div>

          <Select value={selectedVenueId} onValueChange={onVenueChange}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Pilih Venue" />
            </SelectTrigger>
            <SelectContent>
              {venues.map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timetable Table */}
      <div className="border rounded-lg w-full max-w-full overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className="border-collapse w-full"
            style={{ minWidth: "max-content" }}
          >
            <thead>
              <tr className="bg-muted/50">
                <th className="border p-3 text-left font-semibold sticky left-0 bg-background z-10 min-w-[180px]">
                  Court Name
                </th>
                {timeSlots.map((time) => (
                  <th
                    key={time}
                    className="border p-3 text-center font-semibold min-w-[100px]"
                  >
                    {formatTimeDisplay(time)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courts.map((court) => {
                const courtOperatingHours = court.operatingHours || {
                  openHour: "10:00",
                  closeHour: "20:00",
                };

                return (
                  <tr key={court.id} className="hover:bg-muted/30">
                    <td className="border p-3 sticky left-0 bg-background z-10">
                      <div className="font-semibold">{court.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Hours{" "}
                        {formatOperatingHours(
                          courtOperatingHours.openHour,
                          courtOperatingHours.closeHour
                        )}
                      </div>
                    </td>
                    {timeSlots.map((time, timeIndex) => {
                      const bookingInfo = getTimeSlotBooking(
                        time,
                        timeIndex,
                        court.id,
                        bookings,
                        selectedDate,
                        timeSlots
                      );

                      const isBooked = bookingInfo !== null;
                      const isFirstSlot = bookingInfo?.isFirstSlot ?? false;
                      const span = bookingInfo?.span ?? 1;
                      const booking = bookingInfo?.booking;

                      // Check if this cell is part of a booking that starts earlier
                      // If so, skip rendering (it's already merged with colspan from first cell)
                      if (isBooked && !isFirstSlot && span === 0) {
                        return null;
                      }

                      return (
                        <td
                          key={`${court.id}-${time}`}
                          colSpan={isBooked && isFirstSlot ? span : 1}
                          className={cn(
                            "border p-2",
                            isBooked &&
                              "bg-[#ECF1BB]  border-l border-l-4 border-primary",
                            isBooked &&
                              "cursor-pointer hover:bg-[#D4E6D5] transition-colors"
                          )}
                          onClick={() =>
                            handleCellClick(booking ?? null, court.name)
                          }
                        >
                          {isBooked && isFirstSlot && booking ? (
                            <div className="flex flex-col gap-1 p-2">
                              <div className="flex flex-row space-x-1 items-center">
                                <Avatar className="size-6">
                                  <AvatarImage
                                    src={booking.userAvatar}
                                    alt={booking.userName}
                                    sizes="sm"
                                  />
                                  <AvatarFallback className="text-xs">
                                    {booking.userName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="text-xs font-medium">
                                  {booking.userName}
                                </div>
                              </div>

                              <div className="text-xs font-medium text-muted-foreground">
                                {formatTimeRange(booking.timeSlots)}
                              </div>
                              {/* <div className="text-xs">{court.name}</div> */}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      <BookingDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        booking={selectedBooking}
        onMarkAsComplete={handleMarkAsComplete}
      />
    </div>
  );
}
