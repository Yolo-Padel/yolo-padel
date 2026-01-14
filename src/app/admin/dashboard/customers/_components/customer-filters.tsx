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
import { UserStatus } from "@prisma/client";

interface CustomerFiltersProps {
  // Current values
  searchValue: string;
  statusFilter: string;

  // Event handlers
  onSearchSubmit: (value: string) => void;
  onStatusChange: (value: string) => void;

  // UI state
  hasActiveFilters: boolean;
  onReset: () => void;
}

export function CustomerFilters({
  searchValue,
  statusFilter,
  onSearchSubmit,
  onStatusChange,
  hasActiveFilters,
  onReset,
}: CustomerFiltersProps) {
  // Local state for controlled search input
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

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
