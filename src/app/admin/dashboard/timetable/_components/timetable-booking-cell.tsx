import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatTimeRange } from "@/components/timetable-utils";
import { BOOKING_COLORS } from "@/constants/timetable";
import type { Booking, Court } from "@/components/timetable-types";

type TimetableBookingCellProps = {
  court: Court;
  timeSlot: string;
  booking: Booking | null;
  isFirstSlot: boolean;
  span: number;
  onClick?: (booking: Booking | null, court: Court) => void;
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
}: TimetableBookingCellProps) {
  const isBooked = booking !== null;

  if (isBooked && !isFirstSlot && span === 0) {
    return null;
  }

  return (
    <td
      rowSpan={isBooked && isFirstSlot ? span : 1}
      className={cn(
        "border h-[80px]",
        isBooked && `bg-[${BOOKING_COLORS.BOOKED_BG}]`,
        isBooked &&
          `cursor-pointer hover:bg-[${BOOKING_COLORS.BOOKED_HOVER}] transition-colors`
      )}
      onClick={() => onClick?.(booking, court)}
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
        <span className="text-muted-foreground p-2">-</span>
      )}
    </td>
  );
}
