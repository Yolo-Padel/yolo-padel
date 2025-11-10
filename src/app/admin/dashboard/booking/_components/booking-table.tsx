"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import {
  calculatePaginationInfo,
  generatePageNumbers,
  getPaginatedData,
} from "@/lib/pagination-utils";
import { BookingStatus, PaymentStatus } from "@/types/prisma";
import { useBooking } from "@/hooks/use-booking";
import { BookingTableLoading } from "./booking-table-loading";
import { BookingEmptyState } from "./booking-empty-state";
import { BookingDetailsModal } from "./booking-details-modal";
import { formatTimeRange } from "@/lib/time-slots-formatter";

type BookingWithRelations = {
  id: string;
  bookingCode: string;
  bookingDate: Date;
  duration: number;
  totalPrice: number;
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
  order: {
    id: string;
    orderCode: string;
    status: string;
    totalAmount: number;
  } | null;
  payments: {
    id: string;
    amount: number;
    status: PaymentStatus;
    paymentDate: Date | null;
    channelName: string;
  }[];
};

const PAGE_SIZE = 10;

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
    case "CONFIRMED":
      return "bg-[#D0FBE9] text-[#1A7544]";
    case "COMPLETED":
      return "bg-[#E7F0FE] text-[#194185]";
    case "CANCELLED":
      return "bg-[#FFD5D5] text-[#AD1F1F]";
    case "NO_SHOW":
      return "bg-[#FFF4D5] text-[#8B6F00]";
    case "PENDING":
    default:
      return "bg-gray-200 text-gray-700";
  }
}

function getPaymentStatusBadgeClass(status: PaymentStatus): string {
  switch (status) {
    case "PAID":
      return "bg-[#D0FBE9] text-[#1A7544]";
    case "PENDING":
      return "bg-[#FFF4D5] text-[#8B6F00]";
    case "FAILED":
      return "bg-[#FFD5D5] text-[#AD1F1F]";
    case "REFUNDED":
      return "bg-[#E0E0E0] text-[#666666]";
    case "EXPIRED":
      return "bg-[#FFD5D5] text-[#AD1F1F]";
    default:
      return "bg-gray-200 text-gray-700";
  }
}

export function BookingTable() {
  const [page, setPage] = useState(1);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<BookingWithRelations | null>(null);
  const searchParams = useSearchParams();

  // Fetch booking data using the hook
  const { data: response, isLoading, error } = useBooking();

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [searchParams]);

  // Extract bookings from response
  const allBookings = useMemo(() => {
    if (!response?.success || !response?.data) return [];
    return response.data as BookingWithRelations[];
  }, [response]);

  // Filter bookings based on search query
  const filtered = useMemo(() => {
    const q = searchParams.get("search")?.toLowerCase().trim();
    if (!q) return allBookings;
    return allBookings.filter((b) => {
      const userName = b.user?.profile?.fullName || "N/A";
      const venueName = b.court?.venue?.name || "";
      const courtName = b.court?.name || "";
      const channelName = b.payments?.[0]?.channelName || "";

      return (
        b.bookingCode.toLowerCase().includes(q) ||
        userName.toLowerCase().includes(q) ||
        courtName.toLowerCase().includes(q) ||
        venueName.toLowerCase().includes(q) ||
        channelName.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q) ||
        (b.payments?.[0]?.status || "").toLowerCase().includes(q)
      );
    });
  }, [allBookings, searchParams]);

  const paginationInfo = useMemo(
    () => calculatePaginationInfo(page, filtered.length, PAGE_SIZE),
    [page, filtered.length]
  );

  const paginated = useMemo(
    () => getPaginatedData(filtered, page, PAGE_SIZE),
    [filtered, page]
  );

  const columns = [
    "Booking Code",
    "Customer",
    "Date & Time",
    "Status",
    "Payment",
    "Actions",
  ];

  // Show loading state
  if (isLoading) {
    return <BookingTableLoading />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Booking List</h2>
          </div>
          <Button className="text-black" disabled>
            Add Booking
          </Button>
        </div>
        <div className="rounded-2xl border border-[#E9EAEB] p-8 text-center">
          <p className="text-red-600 font-medium mb-2">
            Failed to load bookings
          </p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "An error occurred while fetching bookings"}
          </p>
        </div>
      </div>
    );
  }

  // Show empty state
  const isFiltered = Boolean(searchParams.get("search"));
  if (filtered.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Booking List</h2>
            <Badge className="text-[#6941C6] bg-[#F9F5FF] border-[#E9D7FE] shadow-none rounded-4xl">
              {allBookings.length}{" "}
              {allBookings.length === 1 ? "booking" : "bookings"}
            </Badge>
          </div>
          <Button className="text-black" disabled>
            Add Booking
          </Button>
        </div>
        <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
          <BookingEmptyState isFiltered={isFiltered} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Booking List</h2>
          <Badge className="text-[#6941C6] bg-[#F9F5FF] border-[#E9D7FE] shadow-none rounded-4xl">
            {filtered.length} {filtered.length === 1 ? "booking" : "bookings"}
          </Badge>
        </div>
        <Button className="text-black" disabled>
          Add Booking
        </Button>
      </div>

      <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-11">Booking Code</TableHead>
              <TableHead className="h-11">Customer</TableHead>
              <TableHead className="h-11">Date & Time</TableHead>
              <TableHead className="h-11">Status</TableHead>
              <TableHead className="h-11">Payment</TableHead>
              <TableHead className="h-11 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((b) => {
              const userName = b.user?.profile?.fullName || "N/A";
              const venueName = b.court?.venue?.name || "N/A";
              const courtName = b.court?.name || "N/A";
              const paymentStatus =
                b.payments?.[0]?.status || PaymentStatus.PENDING;

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
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(b.status)}`}
                    >
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getPaymentStatusBadgeClass(paymentStatus)}`}
                      >
                        {paymentStatus === "PAID" ? "Paid" : paymentStatus}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Rp{b.totalPrice.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelected(b);
                        setViewOpen(true);
                      }}
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
              <TableCell colSpan={columns.length} className="p-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!paginationInfo.hasPreviousPage}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                            variant={
                              pageNum === paginationInfo.pageSafe
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setPage(pageNum as number)}
                            className="w-8 h-8 p-0 bg-[#FAFAFA] border border-[#E9EAEB] text-[#A4A7AE] hover:bg-[#E9EAEB]"
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
                    onClick={() =>
                      setPage((p) => Math.min(paginationInfo.totalPages, p + 1))
                    }
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

      <BookingDetailsModal
        open={viewOpen}
        onOpenChange={setViewOpen}
        booking={selected}
      />
    </div>
  );
}
