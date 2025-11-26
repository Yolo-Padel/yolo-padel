import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export interface BookingHeaderProps {
  bookingCount: number;
  onAddBooking: () => void;
  canCreateBooking: boolean;
  isLoadingPermission: boolean;
}

export function BookingHeader({
  bookingCount,
  onAddBooking,
  canCreateBooking,
  isLoadingPermission,
}: BookingHeaderProps) {
  return (
    <div className="flex items-center gap-2 justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">Booking List</h2>
        <Badge className="text-[#6941C6] bg-[#F9F5FF] border-[#E9D7FE] shadow-none rounded-4xl">
          {bookingCount} {bookingCount === 1 ? "booking" : "bookings"}
        </Badge>
      </div>
      {canCreateBooking && !isLoadingPermission && (
        <Button onClick={onAddBooking}>
          <Plus className="size-4" />
          Add Booking
        </Button>
      )}
    </div>
  );
}
