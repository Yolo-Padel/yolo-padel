import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { addDays } from "@/lib/date-utils";
import { TimetableCell } from "./timetable-cell";
import { TimetableTableSkeleton } from "./timetable-table-skeleton";
import {
  generateTimeSlots,
  formatTimeDisplay,
  formatOperatingHours,
} from "@/components/timetable-utils";
import { getTimeSlotBooking } from "@/components/timetable-booking-helpers";
import { BOOKING_COLORS } from "@/constants/timetable";
import type { Court, Booking } from "@/components/timetable-types";

type TimetableProps = {
  courts: Court[];
  bookings: Booking[];
  selectedDate: Date;
  isLoading?: boolean;
  onCellClick: (booking: Booking | null, courtName: string) => void;
  onDateChange?: (date: Date) => void;
};

/**
 * Timetable Component
 * Renders the main timetable grid with courts and time slots
 */
export function Timetable({
  courts,
  bookings,
  selectedDate,
  isLoading = false,
  onCellClick,
  onDateChange,
}: TimetableProps) {
  const timeSlots = React.useMemo(() => generateTimeSlots(), []);
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    onDateChange?.(date);
  };

  const goToPreviousDay = () => {
    const prev = addDays(selectedDate, -1);
    handleDateChange(prev);
  };

  const goToNextDay = () => {
    const next = addDays(selectedDate, 1);
    handleDateChange(next);
  };

  const goToToday = () => {
    handleDateChange(new Date());
  };

  const goToTomorrow = () => {
    const tomorrow = addDays(new Date(), 1);
    handleDateChange(tomorrow);
  };

  // Format tanggal untuk display: "Mon, 14 Okt"
  const formattedDate = format(selectedDate, "EEE, d MMM", { locale: id });

  // Show skeleton when loading
  if (isLoading) {
    return <TimetableTableSkeleton />;
  }

  return (
    <div className="border rounded-lg w-full max-w-full overflow-hidden">
      <div className="overflow-x-auto">
        <table
          className="border-collapse w-full"
          style={{ minWidth: "max-content" }}
        >
          <thead>
            {/* Row 1: Court Name + Date Navigation */}
            <tr className="bg-muted/50">
              <th className="border p-3 text-left font-semibold sticky left-0 bg-background z-10 min-w-[180px]">
                Court Name
              </th>
              <th
                colSpan={timeSlots.length}
                className="border p-3 text-left font-semibold relative"
                style={{ padding: 0 }}
              >
                <div
                  className="sticky left-[180px] bg-background z-10 p-3"
                  style={{ width: "fit-content" }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousDay}
                      className={`border-[${BOOKING_COLORS.PRIMARY_BORDER}]`}
                      disabled={isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`border-[${BOOKING_COLORS.PRIMARY_BORDER}] gap-2`}
                          disabled={isLoading}
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
                          disabled={isLoading}
                        />
                      </PopoverContent>
                    </Popover>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextDay}
                      className={`border-[${BOOKING_COLORS.PRIMARY_BORDER}]`}
                      disabled={isLoading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToToday}
                      className={`border-[${BOOKING_COLORS.PRIMARY_BORDER}]`}
                      disabled={isLoading}
                    >
                      Go to Today
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToTomorrow}
                      className={`border-[${BOOKING_COLORS.PRIMARY_BORDER}]`}
                      disabled={isLoading}
                    >
                      Tomorrow
                    </Button>
                  </div>
                </div>
              </th>
            </tr>
            {/* Row 2: Time Slots */}
            <tr className="bg-muted/50">
              <th className="border p-3 text-left font-semibold sticky left-0 bg-background z-10 min-w-[180px]">
                {/* Empty cell for Court Name column */}
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

                    const isFirstSlot = bookingInfo?.isFirstSlot ?? false;
                    const span = bookingInfo?.span ?? 1;
                    const booking = bookingInfo?.booking ?? null;

                    return (
                      <TimetableCell
                        key={`${court.id}-${time}`}
                        courtId={court.id}
                        courtName={court.name}
                        timeSlot={time}
                        booking={booking}
                        isFirstSlot={isFirstSlot}
                        span={span}
                        onCellClick={onCellClick}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
