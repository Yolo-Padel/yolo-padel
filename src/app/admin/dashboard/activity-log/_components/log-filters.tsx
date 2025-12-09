"use client";

import { Search, X, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { type DateRange } from "react-day-picker";
import { format } from "date-fns";
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
import { ENTITY_TYPES } from "@/types/entity";

/**
 * Props interface for ActivityLogFilters component
 * Follows the presentation layer pattern - receives props and emits events
 */
interface ActivityLogFiltersProps {
  // Current filter values
  searchValue: string;
  entityTypeFilter: string;
  actionTypeFilter: string;
  startDate: string;
  endDate: string;

  // Event handlers
  onSearchSubmit: (value: string) => void;
  onEntityTypeChange: (value: string) => void;
  onActionTypeChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;

  // UI state
  hasActiveFilters: boolean;
  onReset: () => void;
}

// Action type options for filtering
const ACTION_TYPES = [
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
] as const;

/**
 * ActivityLogFilters Component
 *
 * Pure presentation component for activity log filtering.
 * Follows the clean architecture pattern - receives props, renders UI, emits events.
 *
 * Features:
 * - Search input with Enter key submission
 * - Entity type dropdown (All, Venue, Court, Booking, Order, User, Invoice)
 * - Action type dropdown (All, Create, Update, Delete)
 * - Date range picker (start date, end date)
 * - Reset button (visible when hasActiveFilters)
 *
 * Requirements: 1.1, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 7.1, 7.2, 7.3, 8.5
 */
export function ActivityLogFilters({
  searchValue,
  entityTypeFilter,
  actionTypeFilter,
  startDate,
  endDate,
  onSearchSubmit,
  onEntityTypeChange,
  onActionTypeChange,
  onStartDateChange,
  onEndDateChange,
  hasActiveFilters,
  onReset,
}: ActivityLogFiltersProps) {
  // Local state for controlled search input
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  // Local state for date range popover
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>();

  // Convert string dates to DateRange for calendar
  const dateRange: DateRange | undefined = (() => {
    const from = startDate ? new Date(startDate) : undefined;
    const to = endDate ? new Date(endDate) : undefined;

    if (!from && !to) return undefined;

    return { from, to };
  })();

  /**
   * Handle Enter key press for search submission
   * Only submits on Enter key to avoid excessive API calls
   */
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
    <div className="flex flex-wrap items-center gap-4">
      {/* Search Input */}
      <InputGroup className="flex-1 min-w-[250px]">
        <InputGroupInput
          placeholder="Search by description, user name, or email..."
          className="w-full"
          value={localSearchValue}
          onChange={(event) => setLocalSearchValue(event.target.value)}
          onKeyDown={handleKeyDown}
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

      {/* Entity Type Filter */}
      <Select
        value={entityTypeFilter || "all"}
        onValueChange={onEntityTypeChange}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All entities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All entities</SelectItem>
          {Object.values(ENTITY_TYPES).map((entityType) => (
            <SelectItem key={entityType} value={entityType}>
              {entityType}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Action Type Filter */}
      <Select
        value={actionTypeFilter || "all"}
        onValueChange={onActionTypeChange}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All actions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All actions</SelectItem>
          {ACTION_TYPES.map((action) => (
            <SelectItem key={action.value} value={action.value}>
              {action.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset Button - Only visible when filters are active */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="default"
          onClick={() => {
            onReset();
            setLocalSearchValue("");
          }}
          aria-label="Reset filters"
        >
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
}
