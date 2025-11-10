"use client"

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
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from "lucide-react"

export function UsersTableLoading() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Team Members</h2>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Button disabled className="text-black">
          Add User
          <Plus className="ml-2 size-4" />
        </Button>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
              <TableHead className="h-11">Name</TableHead>
              <TableHead className="h-11">Status</TableHead>
              <TableHead className="h-11">Role</TableHead>
              <TableHead className="h-11">Email address</TableHead>
              <TableHead className="h-11">Join Date</TableHead>
              <TableHead className="h-11 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Loading rows */}
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
                <TableCell className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <Skeleton className="h-4 w-12" />
                </div>
              </TableCell>
              <TableCell>
                  <Skeleton className="h-4 w-12" />
              </TableCell>
              <TableCell>
                  <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                  <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="text-right">
                  <Skeleton className="h-8 w-16 ml-auto" />
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
