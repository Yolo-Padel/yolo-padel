import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

export function VenueTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-1">
        <Skeleton className="h-7 w-32" />
        <Button disabled className="font-normal bg-gray-100 text-gray-400 rounded-sm">
          Add Venue
          <PlusIcon className="mr-2 size-4" />
        </Button>
      </div>

      {/* Cards Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="min-w-0 max-w-[265px] shadow-lg p-1 gap-2">
            <CardHeader className="p-2">
              <Skeleton className="w-full h-32 rounded-sm" />
            </CardHeader>
            <CardContent className="px-2 pt-0 pb-1 text-sm gap-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
            <CardFooter className="px-1 pt-0 pb-1 w-full min-w-0 grid grid-cols-2 gap-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination Section */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  )
}
