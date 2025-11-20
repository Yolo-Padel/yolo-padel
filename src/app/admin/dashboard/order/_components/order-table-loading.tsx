"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function OrderTableLoading() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Order List</h2>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-11">Order Code</TableHead>
              <TableHead className="h-11">Customer</TableHead>
              <TableHead className="h-11">Amount</TableHead>
              <TableHead className="h-11">Payment Status</TableHead>
              <TableHead className="h-11">Order Status</TableHead>
              <TableHead className="h-11 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Loading rows */}
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="bg-transparent">
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
  );
}
