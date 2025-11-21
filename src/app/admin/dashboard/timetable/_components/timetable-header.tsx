import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Plus } from "lucide-react";
import { BOOKING_COLORS } from "@/constants/timetable";
import type { Venue } from "@/components/timetable-types";

type TimetableHeaderProps = {
  venues: Venue[];
  selectedVenueId?: string;
  onVenueChange?: (venueId: string) => void;
  onAddBooking?: () => void;
  isLoading?: boolean;
};

/**
 * Timetable Header Component
 * Handles venue selection and filter controls
 */
export function TimetableHeader({
  venues,
  selectedVenueId,
  onVenueChange,
  onAddBooking,
  isLoading = false,
}: TimetableHeaderProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-full">
      {/* Venue Selector Row */}
      <div className="flex items-center gap-2 w-full flex-wrap justify-between">
        <Select
          value={selectedVenueId}
          onValueChange={onVenueChange}
          disabled={isLoading}
        >
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

        <div className="flex items-center gap-2 shrink-0">

          {/* Add Booking Button */}
          {onAddBooking && (
            <Button
              className={`border-[${BOOKING_COLORS.PRIMARY_BORDER}] gap-2`}
              onClick={onAddBooking}
              disabled={isLoading || !selectedVenueId}
            >
              Add Booking
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        {/* Filter Button */}
        
        {/* Hide Filter Button
        <Button
          variant="outline"
          size="sm"
          className={`border-[${BOOKING_COLORS.PRIMARY_BORDER}] gap-2 shrink-0`}
          disabled={isLoading}
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        */}
      </div>
    </div>
  );
}
