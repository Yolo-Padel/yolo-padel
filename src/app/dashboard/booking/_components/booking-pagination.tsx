"use client";

import { Button } from "@/components/ui/button";

export interface BookingPaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  displayedItems: number;
}

interface BookingPaginationProps {
  paginationInfo: BookingPaginationInfo;
  onPageChange: (page: number) => void;
}

/**
 * Pure presentational component for booking pagination
 */
export function BookingPagination({
  paginationInfo,
  onPageChange,
}: BookingPaginationProps) {
  const { currentPage, totalPages, totalItems, displayedItems } =
    paginationInfo;

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {displayedItems} of {totalItems} bookings
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="border-brand/40"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <div className="text-sm">
          Page {currentPage} / {totalPages}
        </div>
        <Button
          variant="outline"
          className="border-brand/40"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
