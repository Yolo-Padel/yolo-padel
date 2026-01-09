import { Button } from "@/components/ui/button";
import { LandPlot } from "lucide-react";
import Image from "next/image";

export function BookingEmptyState({
  onBookCourt,
}: {
  onBookCourt: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-50 h-50 flex items-center justify-center mb-6">
        <Image
          src="/booking-court-illustration.svg"
          alt="search"
          width={350}
          height={350}
        />
      </div>

      <h3 className="text-xl font-medium mb-2">No Bookings Yet</h3>

      <p className="text-muted-foreground text-center mb-6 max-w-xs font-light">
        You haven&apos;t booked a court yet. Start your first game today!
      </p>

      <Button
        className="bg-brand text-brand-foreground hover:bg-brand/90 mx-auto px-6 py-2"
        onClick={onBookCourt}
      >
        Book Court
        <LandPlot className="size-4" />
      </Button>
    </div>
  );
}
