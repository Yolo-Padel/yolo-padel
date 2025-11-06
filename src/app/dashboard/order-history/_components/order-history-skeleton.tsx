import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OrderHistorySkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="gap-1 p-1 border-foreground">
          <CardHeader className="p-2 pb-0">
            {/* Image skeleton */}
            <Skeleton className="w-full h-[142px] aspect-square rounded-md" />

            {/* Title skeleton */}
            <div className="flex justify-between items-center mt-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </CardHeader>

          <CardContent className="px-2 text-md gap-1">
            {/* Date skeleton */}
            <Skeleton className="h-4 w-32 mb-1" />

            {/* Content skeletons */}
            <div className="pt-1 pb-4 space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-20" />
            </div>
          </CardContent>

          <CardFooter className="min-w-0 px-1 mb-1">
            {/* Button skeleton */}
            <Skeleton className="h-10 w-full rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
