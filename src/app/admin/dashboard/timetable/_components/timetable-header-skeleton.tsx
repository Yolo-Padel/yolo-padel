import { Skeleton } from "@/components/ui/skeleton";

type TimetableHeaderSkeletonProps = {
  /**
   * Whether to show venue selector skeleton
   * Set to false when venue is already selected and just loading courts/bookings
   */
  showVenueSelector?: boolean;
};

/**
 * Skeleton loading for timetable header (venue selector + date navigation)
 * Used when header data is being refreshed (e.g., venue change)
 */
export function TimetableHeaderSkeleton({
  showVenueSelector = true,
}: TimetableHeaderSkeletonProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-full">
      {/* Venue Selector Row */}
      {showVenueSelector && (
        <div className="flex items-center gap-2 w-full flex-wrap">
          <Skeleton className="h-10 w-[280px]" />
        </div>
      )}

      {/* Date Navigation Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full max-w-full">
        {/* Date Navigation Skeleton */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
        </div>

        {/* Filter Button Skeleton */}
        <Skeleton className="h-9 w-20 shrink-0" />
      </div>
    </div>
  );
}
