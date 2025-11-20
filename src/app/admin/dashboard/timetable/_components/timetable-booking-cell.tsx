import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  formatTimeRange,
  isTimeSlotInOperatingHours,
} from "@/components/timetable-utils";
import { BOOKING_COLORS } from "@/constants/timetable";
import type { Booking, Court } from "@/components/timetable-types";

type TimetableBookingCellProps = {
  court: Court;
  timeSlot: string;
  booking: Booking | null;
  isFirstSlot: boolean;
  span: number;
  onClick?: (params: {
    booking: Booking | null;
    court: Court;
    timeSlot: string;
  }) => void;
  onMouseDown?: (court: Court, timeSlot: string) => void;
  onMouseEnter?: (court: Court, timeSlot: string) => void;
  isDragPreview?: boolean;
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
  onClick,
  onMouseDown,
  onMouseEnter,
  isDragPreview = false,
}: TimetableBookingCellProps) {
  const isBooked = booking !== null;

  // Check if court is open for this time slot
  const isCourtOpen = isTimeSlotInOperatingHours(
    timeSlot,
    court.operatingHours?.fullOperatingHours
  );

  if (isBooked && !isFirstSlot && span === 0) {
    return null;
  }

  // Disable cell if court is not open
  const isDisabled = !isCourtOpen;

  return (
    <td
      rowSpan={isBooked && isFirstSlot ? span : 1}
      className={cn(
        "border h-[80px]",
        isBooked &&
          `bg-[${BOOKING_COLORS.BOOKED_BG}] border-l-2 border-l-[#B1BF20]`,
        isBooked &&
          `cursor-pointer hover:bg-[${BOOKING_COLORS.BOOKED_HOVER}] transition-colors`,
        isDisabled && !isBooked && "bg-muted/30 opacity-50 cursor-not-allowed",
        isDragPreview &&
          !isBooked &&
          !isDisabled &&
          "bg-primary/10 border-primary/60 ring-1 ring-primary/40"
      )}
      onClick={() => {
        if (!isDisabled) {
          onClick?.({ booking, court, timeSlot });
        }
      }}
      onMouseDown={(event) => {
        // Only allow dragging on empty, enabled cells
        if (!isBooked && !isDisabled && onMouseDown) {
          event.preventDefault();
          onMouseDown(court, timeSlot);
        }
      }}
      onMouseEnter={() => {
        // Only trigger onMouseEnter for valid cells (not booked continuation slots)
        if (isBooked && !isFirstSlot && span === 0) return;
        if (!isBooked && !isDisabled && onMouseEnter) {
          onMouseEnter(court, timeSlot);
        }
      }}
      title={
        isDisabled && !isBooked ? "Court belum buka pada waktu ini" : undefined
      }
    >
      {isBooked && isFirstSlot && booking ? (
        <div className="flex flex-col gap-1 p-2">
          <div className="flex flex-row items-center gap-2">
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
            isDisabled ? "text-muted-foreground/50" : "text-muted-foreground"
          )}
        >
          {isDisabled ? "Closed" : "-"}
        </span>
      )}
    </td>
  );
}
