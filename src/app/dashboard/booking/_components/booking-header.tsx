"use client";

import { Button } from "@/components/ui/button";
import { LandPlot } from "lucide-react";

interface BookingHeaderProps {
  onBookCourt: () => void;
}

/**
 * Header component for booking list page
 * Pure presentational component - receives props, renders UI
 */
export function BookingHeader({ onBookCourt }: BookingHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-1">
      <h3 className="text-xl font-semibold">Booking List</h3>
      <Button
        onClick={onBookCourt}
        className="bg-brand text-brand-foreground hover:bg-brand/90"
      >
        Book Court
        <LandPlot className="size-4" />
      </Button>
    </div>
  );
}
