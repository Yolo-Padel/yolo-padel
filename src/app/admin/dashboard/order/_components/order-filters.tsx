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
import { PaymentStatus, Venue, UserType } from "@prisma/client";
import { useVenue } from "@/hooks/use-venue";
import { useAuth } from "@/hooks/use-auth";

interface OrderFiltersProps {
  searchValue: string;
  onSearchSubmit: (value: string) => void;
  venueFilter: string;
  onVenueFilterChange: (value: string) => void;
  paymentStatusFilter: string;
  onPaymentStatusFilterChange: (value: string) => void;
  hasActiveFilters: boolean;
  onReset: () => void;
}

export function OrderFilters({
  searchValue,
  onSearchSubmit,
  venueFilter,
  onVenueFilterChange,
  paymentStatusFilter,
  onPaymentStatusFilterChange,
  hasActiveFilters,
  onReset,
}: OrderFiltersProps) {
  const { data: venuesData } = useVenue();
  const { user } = useAuth();
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  // API returns { success, data: Venue[], message }
  const allVenues: Venue[] = venuesData?.data || [];

  // Filter venues based on user type and assigned venues
  let venues: Venue[] = [];

  if (user) {
    // Admin can see all venues
    if (user.userType === UserType.ADMIN) {
      venues = allVenues;
    }
    // Staff can only see assigned venues
    else if (user.userType === UserType.STAFF) {
      if (user.assignedVenueIds && user.assignedVenueIds.length > 0) {
        venues = allVenues.filter((venue) =>
          user.assignedVenueIds.includes(venue.id),
        );
      }
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSearchSubmit(localSearchValue);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <InputGroup className="flex-1 border-brand/40">
        <InputGroupInput
          placeholder="Search by order code or customer name..."
          className="w-full"
          value={localSearchValue}
          onChange={(event) => setLocalSearchValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>

      <Select value={venueFilter || "all"} onValueChange={onVenueFilterChange}>
        <SelectTrigger className="w-[200px] border-brand/40">
          <SelectValue placeholder="All venues" />
        </SelectTrigger>
        <SelectContent className="border-brand/40">
          <SelectItem value="all">All venues</SelectItem>
          {venues.map((venue) => (
            <SelectItem key={venue.id} value={venue.id}>
              {venue.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={paymentStatusFilter || "all"}
        onValueChange={onPaymentStatusFilterChange}
      >
        <SelectTrigger className="w-[200px] border-brand/40">
          <SelectValue placeholder="All status" />
        </SelectTrigger>
        <SelectContent className="border-brand/40">
          <SelectItem value="all">All status</SelectItem>
          {Object.values(PaymentStatus).map((status) => (
            <SelectItem key={status} value={status}>
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
