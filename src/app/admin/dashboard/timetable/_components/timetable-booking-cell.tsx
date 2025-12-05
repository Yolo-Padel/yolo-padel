import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  formatTimeRange,
  isTimeSlotInOperatingHours,
} from "@/components/timetable-utils";
import { BOOKING_COLORS } from "@/constants/timetable";
import type { Booking, Court } from "@/components/timetable-types";
import { BookingStatus } from "@/types/prisma";

type TimetableBookingCellProps = {
  court: Court;
  timeSlot: string;
  booking: Booking | null;
  isFirstSlot: boolean;
  span: number;
  selectedDate: Date;
  onClick?: (params: {
    booking: Booking | null;
    court: Court;
    timeSlot: string;
  }) => void;
  onMouseDown?: (court: Court, timeSlot: string) => void;
  onMouseEnter?: (court: Court, timeSlot: string) => void;
  isDragPreview?: boolean;
  canCreateBooking: boolean;
  isLoadingPermission: boolean;
};

/**
 * TimetableBookingCell
 * Render khusus untuk menampilkan booking pada timetable grid.
 */
export function TimetableBookingCell({
  court,
  timeSlot,
  booking,
  isFirstSlot,
  span,
  selectedDate,
  onClick,
  onMouseDown,
  onMouseEnter,
  isDragPreview = false,
  canCreateBooking = false,
  isLoadingPermission = false,
}: TimetableBookingCellProps) {
  const isBooked = booking !== null;

  // Check if court is open for this time slot
  const isCourtOpen = isTimeSlotInOperatingHours(
    timeSlot,
    court.operatingHours?.fullOperatingHours
  );

  // Check if the selected date/time slot is in the past
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const selectedDay = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  ).getTime();

  const isPastDate = selectedDay < today;

  let isPastTimeSlot = false;
  const isToday = selectedDay === today;

  if (isToday) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Jika waktu sekarang 17:30, cutoff menjadi 18:00
    const cutoffHour = currentMinute > 0 ? currentHour + 1 : currentHour;
    const cutoffTime = `${String(cutoffHour).padStart(2, "0")}:00`;

    // Contoh: timeSlot "17:00" < cutoff "18:00" -> dianggap sudah lewat
    isPastTimeSlot = timeSlot < cutoffTime;
  }

  const isPast = isPastDate || isPastTimeSlot;

  if (isBooked && !isFirstSlot && span === 0) {
    return null;
  }

  // Disable cell if court is not open or if it's past (for styling purposes)
  // But allow clicking on past bookings to view details
  const isDisabledForStyling = !isCourtOpen || (isPast && !isBooked);
  const canClickBooking = isBooked; // Allow clicking on any booking, even if past

  // Determine background and border colors based on booking status
  const getBookingStyles = () => {
    if (!isBooked || !booking) return null;

    if (booking.status === BookingStatus.NO_SHOW) {
      return "bg-[#F3BFB2] border-l-2 border-l-[#C52E05]";
    }
    if (booking.status === BookingStatus.COMPLETED) {
      return "bg-[#EBEBEB] border-l-2 border-l-[#5C5C5C]";
    }
    // Default colors for other statuses
    return `bg-[${BOOKING_COLORS.BOOKED_BG}] border-l-2 border-l-[#B1BF20]`;
  };

  return (
    <td
      rowSpan={isBooked && isFirstSlot ? span : 1}
      className={cn(
        "border h-[80px] p-2 align-top",
        getBookingStyles(),
        isBooked &&
          `cursor-pointer hover:bg-[${BOOKING_COLORS.BOOKED_HOVER}] transition-colors`,
        isDisabledForStyling &&
          !isBooked &&
          "bg-muted/30 opacity-50 cursor-not-allowed",
        isDragPreview &&
          !isBooked &&
          !isDisabledForStyling &&
          "bg-primary/10 border-primary/60 ring-1 ring-primary/40"
      )}
      onClick={() => {
        // Allow clicking on bookings even if they're in the past
        if (canClickBooking && canCreateBooking) {
          onClick?.({ booking, court, timeSlot });
        }
      }}
      onMouseDown={(event) => {
        // Only allow dragging on empty, enabled cells (not past slots)
        if (
          !isBooked &&
          !isDisabledForStyling &&
          onMouseDown &&
          canCreateBooking
        ) {
          event.preventDefault();
          onMouseDown(court, timeSlot);
        }
      }}
      onMouseEnter={() => {
        // Only trigger onMouseEnter for valid cells (not booked continuation slots)
        if (isBooked && !isFirstSlot && span === 0) return;
        if (
          !isBooked &&
          !isDisabledForStyling &&
          onMouseEnter &&
          canCreateBooking
        ) {
          onMouseEnter(court, timeSlot);
        }
      }}
      title={
        isDisabledForStyling && !isBooked
          ? "Court is closed at this time"
          : undefined
      }
    >
      {isBooked && isFirstSlot && booking ? (
        <div className="flex flex-col gap-1 p-2">
          <div className="flex flex-row gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={booking.userAvatar} alt={booking.userName} />
              <AvatarFallback className="text-[10px]">
                {booking.userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs font-medium">{booking.userName}</div>
          </div>
          <div className="text-xs font-medium">
            {formatTimeRange(booking.timeSlots)}
          </div>
          <div className="text-xs">{court.name}</div>
        </div>
      ) : (
        <span
          className={cn(
            "p-2",
            isDisabledForStyling
              ? "text-muted-foreground/50"
              : "text-muted-foreground"
          )}
        >
          {isDisabledForStyling ? "Closed" : "-"}
        </span>
      )}
    </td>
  );
}
