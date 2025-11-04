import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export const BookingFormSkeleton = ({ isModal = false }: { isModal?: boolean }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="relative">
        <div className={isModal ? "pr-8 gap-0" : ""}>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        {isModal && (
          <Skeleton className="absolute top-0 right-0 h-8 w-8 rounded-full" />
        )}
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-4 mb-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
        <Separator />
      </div>

      {/* Available Court */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 h-[80px]">
          {[...Array(4)].map((_, idx) => (
            <Skeleton key={idx} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      </div>

      {/* Calendar and Time Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calendar */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <div className="rounded-lg border p-2">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {[...Array(7)].map((_, idx) => (
                <Skeleton key={idx} className="h-8 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, idx) => (
                <Skeleton key={idx} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Time Slots */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, idx) => (
              <Skeleton key={idx} className="h-9 w-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Total Payment */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Book Now Button */}
      <Skeleton className="h-11 w-full" />
    </div>
  );
};

