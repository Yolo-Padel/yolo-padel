"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, MoreHorizontal, Eye } from "lucide-react";
import { generatePageNumbers } from "@/lib/pagination-utils";
import { BookingStatus } from "@/types/prisma";
import { formatTimeRange } from "@/lib/time-slots-formatter";
import { stringUtils } from "@/lib/format/string";
import { cn } from "@/lib/utils";

export type BookingWithRelations = {
  id: string;
  bookingCode: string;
  bookingDate: Date;
  duration: number;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  timeSlots: {
    id: string;
    openHour: string;
    closeHour: string;
  }[];
  user: {
    id: string;
    email: string;
    profile: {
      fullName: string;
      avatar: string | null;
    } | null;
  };
  court: {
    id: string;
    name: string;
    venue: {
      id: string;
      name: string;
      city: string;
    };
  };
};

export interface PaginationInfo {
  pageSafe: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface BookingTableProps {
  bookings: BookingWithRelations[];
  paginationInfo: PaginationInfo;
  onPageChange: (page: number) => void;
  onViewBooking: (booking: BookingWithRelations) => void;
}

function formatDate(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusBadgeClass(status: BookingStatus): string {
  switch (status) {
    case BookingStatus.UPCOMING:
      return "bg-[#D0FBE9] text-[#1A7544]";
    case BookingStatus.COMPLETED:
      return "bg-[#E7F0FE] text-[#194185]";
    case BookingStatus.CANCELLED:
      return "bg-[#FFD5D5] text-[#AD1F1F]";
    case BookingStatus.NO_SHOW:
      return "bg-[#FFF4D5] text-[#8B6F00]";
    case BookingStatus.PENDING:
    default:
      return "bg-gray-200 text-gray-700";
  }
}

export function BookingTable({
  bookings,
  paginationInfo,
  onPageChange,
  onViewBooking,
}: BookingTableProps) {
  const paginationButtonBaseClass =
    "w-8 h-8 p-0 bg-[#FAFAFA] border border-[#E9EAEB] text-[#A4A7AE] hover:bg-[#E9EAEB]";
  const paginationButtonActiveClass =
    "bg-primary border-primary hover:bg-primary text-black";

  return (
    <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="h-11">Booking Code</TableHead>
            <TableHead className="h-11">Customer</TableHead>
            <TableHead className="h-11">Date & Time</TableHead>
            <TableHead className="h-11">Status</TableHead>
            <TableHead className="h-11 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((b) => {
            const userName = b.user?.profile?.fullName || "N/A";
            const venueName = b.court?.venue?.name || "N/A";
            const courtName = b.court?.name || "N/A";

            return (
              <TableRow key={b.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{b.bookingCode}</span>
                    <span className="text-xs text-muted-foreground">
                      {courtName} · {venueName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{userName}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">
                      {formatDate(b.bookingDate)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeRange(b.timeSlots)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`text-xs font-medium ${getStatusBadgeClass(b.status)}`}
                  >
                    {stringUtils.toTitleCase(b.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewBooking(b)}
                    className="border-none shadow-none"
                  >
                    <Eye className="size-4 text-[#A4A7AE]" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter className="bg-transparent">
          <TableRow>
            <TableCell colSpan={5} className="p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!paginationInfo.hasPreviousPage}
                  onClick={() => onPageChange(paginationInfo.pageSafe - 1)}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {generatePageNumbers(
                    paginationInfo.pageSafe,
                    paginationInfo.totalPages
                  ).map((pageNum, index) => (
                    <div key={index}>
                      {pageNum === "..." ? (
                        <div className="flex items-center justify-center w-8 h-8 bg-background border border-[#E9EAEB] text-[#A4A7AE]">
                          <MoreHorizontal className="w-4 h-4" />
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPageChange(pageNum as number)}
                          className={cn(
                            paginationButtonBaseClass,
                            pageNum === paginationInfo.pageSafe &&
                              paginationButtonActiveClass
                          )}
                        >
                          {pageNum}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!paginationInfo.hasNextPage}
                  onClick={() => onPageChange(paginationInfo.pageSafe + 1)}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
