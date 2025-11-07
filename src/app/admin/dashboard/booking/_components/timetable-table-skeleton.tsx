import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loading for timetable table only
 * Used when only table data is being refreshed (e.g., date change)
 */
export function TimetableTableSkeleton() {
  const timeSlots = Array.from({ length: 18 }, (_, i) => i); // 6:00 - 23:00 = 18 slots
  const courts = Array.from({ length: 5 }, (_, i) => i); // Assume 5 courts default

  return (
    <div className="border rounded-lg w-full max-w-full overflow-hidden">
      <div className="overflow-x-auto">
        <table
          className="border-collapse w-full"
          style={{ minWidth: "max-content" }}
        >
          <thead>
            <tr className="bg-muted/50">
              <th className="border p-3 text-left sticky left-0 bg-background z-10 min-w-[180px]">
                <Skeleton className="h-5 w-24" />
              </th>
              {timeSlots.map((_, index) => (
                <th
                  key={index}
                  className="border p-3 text-center min-w-[100px]"
                >
                  <Skeleton className="h-4 w-12 mx-auto" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courts.map((courtIndex) => (
              <tr key={courtIndex} className="hover:bg-muted/30">
                <td className="border p-3 sticky left-0 bg-background z-10">
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </td>
                {timeSlots.map((slotIndex) => (
                  <td
                    key={`${courtIndex}-${slotIndex}`}
                    className="border p-2 text-center"
                  >
                    {/* Randomly show some "booked" looking cells */}
                    {(courtIndex + slotIndex) % 7 === 0 ? (
                      <div className="flex flex-col items-center gap-1 p-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

