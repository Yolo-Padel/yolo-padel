"use client";

import { ClipboardList } from "lucide-react";

interface ActivityLogEmptyStateProps {
  isFiltered?: boolean;
}

export function ActivityLogEmptyState({
  isFiltered = false,
}: ActivityLogEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-[#E9EAEB] p-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <ClipboardList className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-lg font-semibold">
        {isFiltered ? "No matching activities" : "No activities yet"}
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        {isFiltered
          ? "Try adjusting the filters or use a different keyword."
          : "Admin activities will appear here once changes happen in the system."}
      </p>
    </div>
  );
}
