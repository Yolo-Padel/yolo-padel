import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table"
import { CourtBreadcrumb } from "@/app/admin/dashboard/court/_components/court-breadcrumb"
import { Plus } from "lucide-react"

export function CourtTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex items-center gap-2 justify-between">
        <CourtBreadcrumb />
        <Button disabled className="text-black bg-gray-100">
          Add Court
          <Plus className="ml-2 size-4" />
        </Button>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-11">Court Name</TableHead>
              <TableHead className="h-11">Status</TableHead>
              <TableHead className="h-11">Price (Hour)</TableHead>
              <TableHead className="h-11">Availability</TableHead>
              <TableHead className="h-11">Availability Time</TableHead>
              <TableHead className="h-11 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 rounded" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6} className="p-4">
                <div className="flex items-center justify-between">
                  {/* Previous Button Skeleton */}
                  <Skeleton className="h-8 w-20" />
                  
                  {/* Page Numbers Skeleton */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Skeleton key={index} className="h-8 w-8" />
                    ))}
                  </div>
                  
                  {/* Next Button Skeleton */}
                  <Skeleton className="h-8 w-16" />
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}
