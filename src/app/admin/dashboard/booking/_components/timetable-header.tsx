import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { addDays } from "@/lib/date-utils";
import { BOOKING_COLORS } from "@/constants/timetable";
import type { Venue } from "@/components/timetable-types";

type TimetableHeaderProps = {
  venues: Venue[];
  selectedVenueId?: string;
  onVenueChange?: (venueId: string) => void;
  selectedDate: Date;
  onDateChange?: (date: Date) => void;
  isLoading?: boolean;
};

/**
 * Timetable Header Component
 * Handles venue selection and date navigation controls
 */
export function TimetableHeader({
  venues,
  selectedVenueId,
  onVenueChange,
  selectedDate,
  onDateChange,
  isLoading = false,
}: TimetableHeaderProps) {
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

  return (
    <div className="flex flex-col gap-4 w-full max-w-full">
      {/* Venue Selector Row */}
      <div className="flex items-center gap-2 w-full flex-wrap">
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
      </div>

      {/* Date Navigation Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full max-w-full">
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

        {/* Filter Button */}
        <Button
          variant="outline"
          size="sm"
          className={`border-[${BOOKING_COLORS.PRIMARY_BORDER}] gap-2 shrink-0`}
          disabled={isLoading}
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>
    </div>
  );
}

