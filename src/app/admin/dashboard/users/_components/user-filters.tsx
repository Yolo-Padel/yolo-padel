"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
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
import { UserType, UserStatus, Venue } from "@prisma/client";
import { useVenue } from "@/hooks/use-venue";
import { useAuth } from "@/hooks/use-auth";

interface UserFiltersProps {
  // Current values
  searchValue: string;
  userTypeFilter: string;
  statusFilter: string;
  venueFilter: string;

  // Event handlers
  onSearchSubmit: (value: string) => void;
  onUserTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onVenueChange: (value: string) => void;

  // UI state
  hasActiveFilters: boolean;
  onReset: () => void;
}

export function UserFilters({
  searchValue,
  userTypeFilter,
  statusFilter,
  venueFilter,
  onSearchSubmit,
  onUserTypeChange,
  onStatusChange,
  onVenueChange,
  hasActiveFilters,
  onReset,
}: UserFiltersProps) {
  const { data: venuesData, isLoading: isLoadingVenues } = useVenue();
  const { user } = useAuth();

  // Local state for controlled search input
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  // API returns { success, data: Venue[], message }
  const allVenues: Venue[] = venuesData?.data || [];

  // Filter venues based on user type and assigned venues
  let venues: Venue[] = [];

  if (user) {
    // Admin can see all venues
    if (user.userType === UserType.ADMIN) {
      venues = allVenues.filter(
        (venue: { isActive: boolean; isArchived: boolean }) =>
          venue.isActive && !venue.isArchived,
      );
    }
    // Staff can only see assigned venues
    else if (user.userType === UserType.STAFF) {
      if (user.assignedVenueIds && user.assignedVenueIds.length > 0) {
        venues = allVenues.filter(
          (venue: { id: string; isActive: boolean; isArchived: boolean }) =>
            user.assignedVenueIds.includes(venue.id) &&
            venue.isActive &&
            !venue.isArchived,
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

  return (
    <div className="flex items-center gap-4">
      {/* Search Input */}
      <InputGroup className="flex-1 border-brand/40">
        <InputGroupInput
          placeholder="Search by name or email..."
          className="w-full"
          value={localSearchValue}
          onChange={(event) => setLocalSearchValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>

      {/* User Type Filter */}
      <Select value={userTypeFilter || "all"} onValueChange={onUserTypeChange}>
        <SelectTrigger className="w-full max-w-[160px] border-brand/40">
          <SelectValue placeholder="All user types" />
        </SelectTrigger>
        <SelectContent className=" border-brand/40">
          <SelectItem value="all">All user types</SelectItem>
          <SelectItem value={UserType.ADMIN}>Admin</SelectItem>
          <SelectItem value={UserType.STAFF}>Staff</SelectItem>
          <SelectItem value={UserType.USER}>User</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={statusFilter || "all"} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full max-w-[160px] border-brand/40">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent className=" border-brand/40">
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value={UserStatus.JOINED}>Joined</SelectItem>
          <SelectItem value={UserStatus.INVITED}>Invited</SelectItem>
        </SelectContent>
      </Select>

      {/* Venue Filter */}
      <Select value={venueFilter || "all"} onValueChange={onVenueChange}>
        <SelectTrigger className="w-full max-w-[160px] border-brand/40">
          <SelectValue placeholder="All venues" />
        </SelectTrigger>
        <SelectContent className=" border-brand/40">
          <SelectItem value="all">All venues</SelectItem>
          {venues.map((venue) => (
            <SelectItem key={venue.id} value={venue.id}>
              {venue.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset Filters Button - Conditional visibility */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="default"
          onClick={onReset}
          aria-label="Reset filters"
        >
          <X />
          Reset
        </Button>
      )}
    </div>
  );
}
