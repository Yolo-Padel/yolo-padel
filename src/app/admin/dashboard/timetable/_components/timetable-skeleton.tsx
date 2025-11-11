import { TimetableHeaderSkeleton } from "./timetable-header-skeleton";
import { TimetableTableSkeleton } from "./timetable-table-skeleton";

/**
 * Full skeleton loading component for Timetable
 * Displays placeholder content for initial load
 * Composed of header and table skeletons for reusability
 */
export function TimetableSkeleton() {
  return (
    <div className="space-y-4 w-full max-w-full">
      <TimetableHeaderSkeleton showVenueSelector={true} />
      <TimetableTableSkeleton />
    </div>
  );
}
