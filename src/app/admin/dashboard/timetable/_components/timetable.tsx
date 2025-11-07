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
import { TimetableCell } from "./timetable-cell";
import { TimetableTableSkeleton } from "./timetable-table-skeleton";
import {
  generateTimeSlots,
  formatTimeDisplay,
  formatOperatingHours,
} from "@/components/timetable-utils";
import { getTimeSlotBooking } from "@/components/timetable-booking-helpers";
import type { Court, Booking } from "@/components/timetable-types";

type TimetableProps = {
  courts: Court[];
  bookings: Booking[];
  selectedDate: Date;
  isLoading?: boolean;
  onCellClick: (booking: Booking | null, courtName: string) => void;
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
}: TimetableProps) {
  const timeSlots = React.useMemo(() => generateTimeSlots(), []);

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
