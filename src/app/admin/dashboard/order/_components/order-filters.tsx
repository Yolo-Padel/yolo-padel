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
import { PaymentStatus } from "@prisma/client";
import { useAuth } from "@/hooks/use-auth";

interface OrderFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  venueFilter: string;
  onVenueFilterChange: (value: string) => void;
  paymentStatusFilter: string;
  onPaymentStatusFilterChange: (value: PaymentStatus) => void;
}

export function OrderFilters({
  searchValue,
  onSearchChange,
  venueFilter,
  onVenueFilterChange,
  paymentStatusFilter,
  onPaymentStatusFilterChange,
}: OrderFiltersProps) {
  const { user } = useAuth();
  return (
    <div className="flex items-center gap-4 py-4">
      <InputGroup>
        <InputGroupInput
          placeholder="Search by order number or customer name..."
          className="w-full"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
      <Select value={venueFilter} onValueChange={onVenueFilterChange}>
        <SelectTrigger className="w-full max-w-[240px]">
          <SelectValue placeholder="Filter by venue" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All venues</SelectItem>
          {user && user.assignedVenueIds.length > 0 && (
            <>
              {user.assignedVenueIds.map((venueId) => (
                <SelectItem key={venueId} value={venueId}>
                  {venueId}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>

      <Select
        value={paymentStatusFilter}
        onValueChange={onPaymentStatusFilterChange}
      >
        <SelectTrigger className="w-full max-w-[240px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua status</SelectItem>
          {Object.values(PaymentStatus).map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
