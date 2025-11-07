import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatTimeRange } from "@/components/timetable-utils";
import { BOOKING_COLORS } from "@/constants/timetable";
import type { Booking } from "@/components/timetable-types";

type TimetableCellProps = {
  courtId: string;
  courtName: string;
  timeSlot: string;
  booking: Booking | null;
  isFirstSlot: boolean;
  span: number;
  onCellClick: (booking: Booking | null, courtName: string) => void;
};

/**
 * TimetableCell Component
 * Renders a single time slot cell in the timetable
 * Handles both empty and booked cell states
 */
export function TimetableCell({
  courtId,
  courtName,
  timeSlot,
  booking,
  isFirstSlot,
  span,
  onCellClick,
}: TimetableCellProps) {
  const isBooked = booking !== null;

  // Skip rendering continuation cells (they're merged with colspan)
  if (isBooked && !isFirstSlot && span === 0) {
    return null;
  }

  return (
    <td
      key={`${courtId}-${timeSlot}`}
      colSpan={isBooked && isFirstSlot ? span : 1}
      className={cn(
        "border p-2 text-center align-middle",
        isBooked && `bg-[${BOOKING_COLORS.BOOKED_BG}]`,
        isBooked &&
          `cursor-pointer hover:bg-[${BOOKING_COLORS.BOOKED_HOVER}] transition-colors`
      )}
      onClick={() => onCellClick(booking, courtName)}
    >
      {isBooked && isFirstSlot && booking ? (
        <div className="flex flex-col items-center gap-1 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={booking.userAvatar}
              alt={booking.userName}
            />
            <AvatarFallback>
              {booking.userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-xs font-medium">{booking.userName}</div>
          <div className="text-xs text-muted-foreground">
            {formatTimeRange(booking.timeSlots)}
          </div>
          <div className="text-xs text-muted-foreground">{courtName}</div>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )}
    </td>
  );
}

