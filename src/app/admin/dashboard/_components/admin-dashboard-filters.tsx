"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { type DateRange } from "react-day-picker";
import { useVenue } from "@/hooks/use-venue";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Venue } from "@/types/prisma";
import { getToday, getTomorrow, addDays, isSameDay } from "@/lib/date-utils";

interface AdminDashboardFiltersProps {
  venueFilter: string;
  onVenueChange: (value: string) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  hasActiveFilters: boolean;
  onReset: () => void;
}

export function AdminDashboardFilters({
  venueFilter,
  onVenueChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  hasActiveFilters,
  onReset,
}: AdminDashboardFiltersProps) {
  const { data: venuesData } = useVenue();

  // Local state for popover
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>();
  // Use ref to persist custom mode across re-renders caused by URL sync
  const isCustomModeRef = useRef(false);
  const [, forceUpdate] = useState({});

  // Convert string dates to DateRange for calendar
  const dateRange: DateRange | undefined = useMemo(() => {
    const from = startDate ? new Date(startDate) : undefined;
    const to = endDate ? new Date(endDate) : undefined;

    if (!from && !to) return undefined;

    return { from, to };
  }, [startDate, endDate]);

  // Helper to set custom mode and trigger re-render
  const setIsCustomMode = (value: boolean) => {
    isCustomModeRef.current = value;
    forceUpdate({});
  };

  // Determine current date filter value based on startDate and endDate
  const dateFilter = useMemo(() => {
    // If custom mode is active, keep showing "custom"
    if (isCustomModeRef.current) {
      return "custom";
    }

    // If no dates are set, it's "all" (default)
    if (!startDate && !endDate) {
      return "all";
    }

    // If only one date is set, it's custom
    if (!startDate || !endDate) {
      return "custom";
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = getToday();
    const tomorrow = getTomorrow();
    const yesterday = addDays(today, -1);

    // Check if it's today
    if (isSameDay(start, today) && isSameDay(end, today)) {
      return "today";
    }

    // Check if it's tomorrow
    if (isSameDay(start, tomorrow) && isSameDay(end, tomorrow)) {
      return "tomorrow";
    }

    // Check if it's yesterday
    if (isSameDay(start, yesterday) && isSameDay(end, yesterday)) {
      return "yesterday";
    }

    // Otherwise it's custom
    return "custom";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, isCustomModeRef.current]);

  // Initialize temp date range when popover opens
  useEffect(() => {
    if (isDatePopoverOpen) {
      setTempDateRange(dateRange);
    }
  }, [isDatePopoverOpen, dateRange]);

  // Handle popover close - reset custom mode if no dates were selected
  const handlePopoverOpenChange = (open: boolean) => {
    setIsDatePopoverOpen(open);
    // When popover closes and no dates are set, exit custom mode
    if (!open && !startDate && !endDate) {
      setIsCustomMode(false);
    }
  };

  // Handle date filter change
  const handleDateFilterChange = (value: string) => {
    if (value === "all") {
      // Clear both dates when "All" is selected
      setIsCustomMode(false);
      onStartDateChange("");
      onEndDateChange("");
      setIsDatePopoverOpen(false);
    } else if (value === "today") {
      setIsCustomMode(false);
      const today = getToday();
      onStartDateChange(format(today, "yyyy-MM-dd"));
      onEndDateChange(format(today, "yyyy-MM-dd"));
      setIsDatePopoverOpen(false);
    } else if (value === "tomorrow") {
      setIsCustomMode(false);
      const tomorrow = getTomorrow();
      onStartDateChange(format(tomorrow, "yyyy-MM-dd"));
      onEndDateChange(format(tomorrow, "yyyy-MM-dd"));
      setIsDatePopoverOpen(false);
    } else if (value === "yesterday") {
      setIsCustomMode(false);
      const yesterday = addDays(getToday(), -1);
      onStartDateChange(format(yesterday, "yyyy-MM-dd"));
      onEndDateChange(format(yesterday, "yyyy-MM-dd"));
      setIsDatePopoverOpen(false);
    } else if (value === "custom") {
      // When custom is selected, set custom mode and open the popover
      setIsCustomMode(true);
      setIsDatePopoverOpen(true);
    }
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
    setIsCustomMode(false);
    onStartDateChange("");
    onEndDateChange("");
    setIsDatePopoverOpen(false);
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
      {/* Date Range Picker - Only shown when Custom is selected */}
      {dateFilter === "custom" && (
        <Popover
          open={isDatePopoverOpen}
          onOpenChange={handlePopoverOpenChange}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[300px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={tempDateRange?.from || dateRange?.from}
              selected={tempDateRange}
              onSelect={setTempDateRange}
              numberOfMonths={2}
              className="rounded-lg"
            />
            <div className="flex items-center gap-2 p-3 border-t">
              <Button
                size="sm"
                onClick={handleClearDateRange}
                className="flex-1 bg-primary/20 text-black border border-primary hover:bg-primary/50"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleApplyDateRange}
                className="flex-1"
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
      <Select value={dateFilter} onValueChange={handleDateFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="All Time" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="tomorrow">Tomorrow</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>
      <Select value={venueFilter} onValueChange={onVenueChange}>
        <SelectTrigger>
          <SelectValue placeholder="All venue" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All venue</SelectItem>
          {venuesData?.data?.map((venue: Venue) => (
            <SelectItem key={venue.id} value={venue.id}>
              {venue.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
