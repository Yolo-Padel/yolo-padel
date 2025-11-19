import { Skeleton } from "@/components/ui/skeleton";

export const CourtSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 h-[80px]">
        {[...Array(4)].map((_, idx) => (
          <Skeleton key={idx} className="h-[80px] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
};
