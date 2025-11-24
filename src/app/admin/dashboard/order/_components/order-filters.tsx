"use client";

import { Search } from "lucide-react";
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
import { PaymentStatus, Venue, UserType } from "@prisma/client";
import { useVenue } from "@/hooks/use-venue";
import { useAuth } from "@/hooks/use-auth";

interface OrderFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  venueFilter: string;
  onVenueFilterChange: (value: string) => void;
  paymentStatusFilter: string;
  onPaymentStatusFilterChange: (value: string) => void;
}

export function OrderFilters({
  searchValue,
  onSearchChange,
  venueFilter,
  onVenueFilterChange,
  paymentStatusFilter,
  onPaymentStatusFilterChange,
}: OrderFiltersProps) {
  const { data: venuesData } = useVenue();
  const { user } = useAuth();

  // API returns { success, data: Venue[], message }
  // So we access venuesData.data directly, not venuesData.data.venues
  const allVenues: Venue[] = venuesData?.data || [];

  // Filter venues based on user type and assigned venues
  let venues: Venue[] = [];

  if (user) {
    // Admin can see all venues
    if (user.userType === UserType.ADMIN) {
      venues = allVenues;
    }
    // Staff can only see assigned venues
    else if (
      user.userType === UserType.STAFF &&
      user.assignedVenueIds.length > 0
    ) {
      venues = allVenues.filter((venue) =>
        user.assignedVenueIds.includes(venue.id)
      );
    }
  }

  return (
    <div className="flex items-center gap-4">
      <InputGroup className="flex-1">
        <InputGroupInput
          placeholder="Search by order code or customer name..."
          className="w-full"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>

      <Select value={venueFilter || "all"} onValueChange={onVenueFilterChange}>
        <SelectTrigger className="w-[200px]">
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

      <Select
        value={paymentStatusFilter || "all"}
        onValueChange={onPaymentStatusFilterChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          {Object.values(PaymentStatus).map((status) => (
            <SelectItem key={status} value={status}>
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
