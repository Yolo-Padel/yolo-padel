"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Search, Pencil } from "lucide-react"

export function UsersTableLoading() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled>
            <Pencil className="mr-2 size-4" />
            Add New User
          </Button>
        </div>
        
        <div className="flex items-center justify-end gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search name or email"
              disabled
              className="pl-8 pr-8"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Email Verified</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Loading rows */}
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-24"></div>
                </div>
              </TableCell>
              <TableCell>
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-32"></div>
                </div>
              </TableCell>
              <TableCell>
                <div className="animate-pulse">
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              </TableCell>
              <TableCell>
                <div className="animate-pulse">
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              </TableCell>
              <TableCell>
                <div className="animate-pulse">
                  <div className="h-6 bg-muted rounded w-24"></div>
                </div>
              </TableCell>
              <TableCell>
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-20"></div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="animate-pulse">
                  <div className="h-8 bg-muted rounded w-16 ml-auto"></div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Section */}
      <div className="flex items-center justify-between">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-32"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-20"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-16"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
