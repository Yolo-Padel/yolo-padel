"use client";

import { Search, X, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { type DateRange } from "react-day-picker";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { BookingStatus, Venue } from "@prisma/client";
import { useVenue } from "@/hooks/use-venue";
import { useAuth } from "@/hooks/use-auth";

interface BookingFiltersProps {
  // Current values
  searchValue: string;
  venueFilter: string;
  statusFilter: string;
  startDateValue: string;
  endDateValue: string;

  // Event handlers
  onSearchSubmit: (value: string) => void;
  onVenueChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;

  // UI state
  hasActiveFilters: boolean;
  onReset: () => void;
}

export function BookingFilters({
  searchValue,
  venueFilter,
  statusFilter,
  startDateValue,
  endDateValue,
  onSearchSubmit,
  onVenueChange,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
  hasActiveFilters,
  onReset,
}: BookingFiltersProps) {
  const { data: venuesData } = useVenue();
  const { user } = useAuth();

  // Local state for controlled search input
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  // Local state for date range popover
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>();

  // Convert string dates to DateRange for calendar
  const dateRange: DateRange | undefined = (() => {
    const from = startDateValue ? new Date(startDateValue) : undefined;
    const to = endDateValue ? new Date(endDateValue) : undefined;

    if (!from && !to) return undefined;

    return { from, to };
  })();

  // API returns { success, data: Venue[], message }
  const allVenues: Venue[] = venuesData?.data || [];

  // Filter venues based on user type and assigned venues
  let venues: Venue[] = [];

  if (user) {
    // Admin can see all venues
    if (user.userType === "ADMIN") {
      venues = allVenues.filter(
        (venue: { isActive: boolean; isArchived: boolean }) =>
          venue.isActive && !venue.isArchived
      );
    }
    // Staff can only see assigned venues
    else if (user.userType === "STAFF") {
      if (user.assignedVenueIds && user.assignedVenueIds.length > 0) {
        venues = allVenues.filter(
          (venue: { id: string; isActive: boolean; isArchived: boolean }) =>
            user.assignedVenueIds.includes(venue.id) &&
            venue.isActive &&
            !venue.isArchived
        );
      }
    }
  }

  // Handle Enter key for search submission
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSearchSubmit(localSearchValue);
    }
  };

  // Handle temporary date range changes in popover (before apply)
  const handleTempDateRangeChange = (range: DateRange | undefined) => {
    setTempDateRange(range);
  };

  // Apply the selected date range
  const handleApplyDateRange = () => {
    if (!tempDateRange) {
      // Clear both dates
      onStartDateChange("");
      onEndDateChange("");
    } else {
      // Update start date
      if (tempDateRange.from) {
        onStartDateChange(format(tempDateRange.from, "yyyy-MM-dd"));
      } else {
        onStartDateChange("");
      }

      // Update end date
      if (tempDateRange.to) {
        onEndDateChange(format(tempDateRange.to, "yyyy-MM-dd"));
      } else {
        onEndDateChange("");
      }
    }

    setIsDatePopoverOpen(false);
  };

  // Clear the date range selection
  const handleClearDateRange = () => {
    setTempDateRange(undefined);
    onStartDateChange("");
    onEndDateChange("");
    setIsDatePopoverOpen(false);
  };

  // Initialize temp date range when popover opens
  const handlePopoverOpenChange = (open: boolean) => {
    setIsDatePopoverOpen(open);
    if (open) {
      // Initialize with current date range
      setTempDateRange(dateRange);
    }
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange?.from) {
      return "Pick a date range";
    }

    if (dateRange.to) {
      return `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`;
    }

    return format(dateRange.from, "MMM dd, yyyy");
  };

  return (
    <div className="flex items-center gap-4">
      {/* Search Input */}
      <InputGroup className="flex-1">
        <InputGroupInput
          placeholder="Search by booking code or customer..."
          className="w-full"
          value={localSearchValue}
          onChange={(event) => setLocalSearchValue(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Search bookings"
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>

      {/* Date Range Picker */}
      <Popover open={isDatePopoverOpen} onOpenChange={handlePopoverOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[256px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
            aria-label="Filter by date range"
          >
            <CalendarIcon className="h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={tempDateRange?.from || dateRange?.from}
            selected={tempDateRange}
            onSelect={handleTempDateRangeChange}
            numberOfMonths={2}
            className="rounded-lg"
          />
          <div className="flex items-center gap-2 p-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearDateRange}
              className="flex-1"
            >
              Clear
            </Button>
            <Button size="sm" onClick={handleApplyDateRange} className="flex-1">
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Venue Filter */}
      <Select value={venueFilter || "all"} onValueChange={onVenueChange}>
        <SelectTrigger
          className="w-full max-w-[160px]"
          aria-label="Filter by venue"
        >
          <SelectValue placeholder="All venues" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All venues</SelectItem>
          {venues.map((venue) => (
            <SelectItem key={venue.id} value={venue.id}>
              {venue.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={statusFilter || "all"} onValueChange={onStatusChange}>
        <SelectTrigger
          className="w-full max-w-[160px]"
          aria-label="Filter by status"
        >
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value={BookingStatus.PENDING}>Pending</SelectItem>
          <SelectItem value={BookingStatus.UPCOMING}>Upcoming</SelectItem>
          <SelectItem value={BookingStatus.COMPLETED}>Completed</SelectItem>
          <SelectItem value={BookingStatus.CANCELLED}>Cancelled</SelectItem>
          <SelectItem value={BookingStatus.NO_SHOW}>No Show</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset Filters Button - Conditional visibility */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="default"
          onClick={onReset}
          aria-label="Reset all filters"
          className="ml-auto"
        >
          <X className="h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  );
}
