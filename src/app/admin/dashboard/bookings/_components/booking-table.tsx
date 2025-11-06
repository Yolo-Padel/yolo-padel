"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import {
  Pencil,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { UsersTableLoading } from "@/app/admin/dashboard/users/_components/users-table-loading";
import { useBookings, BookingWithRelations } from "@/hooks/use-bookings";
import { BookingStatus } from "@/types/prisma";
import {
  generatePageNumbers,
  calculatePaginationInfo,
  getPaginatedData,
} from "@/lib/pagination-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookingModal } from "@/app/admin/dashboard/bookings/_components/booking-modal";

const PAGE_SIZE = 10;

export function BookingsTable() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<BookingWithRelations | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<
    | "booking-details"
    | "order-summary"
    | "book-again"
    | "payment-paid"
    | "payment-pending"
    | "booking-payment"
  >("booking-details");

  const searchParams = useSearchParams();

  // Define table columns for colSpan
  const columns = [
    "Name",
    "Status",
    "Court",
    "Amount",
    "Booking Date",
    "Actions",
  ];

  // Fetch bookings data
  const { data, isLoading, error } = useBookings();

  const allBookings = data?.data || [];

  // Frontend filtering and pagination
  const filtered = useMemo(() => {
    const searchQuery = searchParams.get("search")?.toLowerCase().trim();

    if (!searchQuery) {
      return allBookings;
    }

    return allBookings.filter((booking: BookingWithRelations) => {
      const fullName = booking.user?.profile?.fullName?.toUpperCase() || "";
      const email = booking.user?.email.toLowerCase() || "";
      const court = booking.court?.name?.toUpperCase() || "";
      const status = booking.status.toLowerCase();

      return (
        fullName.includes(searchQuery) ||
        email.includes(searchQuery) ||
        court.includes(searchQuery) ||
        status.includes(searchQuery)
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

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [searchParams]);

  // No form submit actions in bookings table for now

  // Show loading state
  if (isLoading) {
    return <UsersTableLoading />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center py-8">
          <p className="text-destructive">
            Failed to load bookings: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const getBookingStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return (
          <Badge variant="outline">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" /> Confirmed
            </div>
          </Badge>
        );
      case BookingStatus.PENDING:
        return (
          <Badge variant="outline">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" /> Pending
            </div>
          </Badge>
        );
      case BookingStatus.CANCELLED:
        return (
          <Badge variant="outline">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" /> Cancelled
            </div>
          </Badge>
        );
      case BookingStatus.COMPLETED:
        return (
          <Badge variant="outline">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> Completed
            </div>
          </Badge>
        );
      case BookingStatus.NO_SHOW:
        return (
          <Badge variant="outline">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-500" /> No Show
            </div>
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Booking List</h2>
          <Badge className="text-[#6941C6] bg-[#F9F5FF] border-[#E9D7FE] shadow-none rounded-4xl">
            {filtered.length} bookings
          </Badge>
        </div>
        <Button disabled={true}>
          Add Booking
          <Plus className="ml-0 size-4" />
        </Button>
      </div>
      <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-11">Name</TableHead>
              <TableHead className="h-11">Status</TableHead>
              <TableHead className="h-11">Court</TableHead>
              <TableHead className="h-11">Amount</TableHead>
              <TableHead className="h-11">Booking Date</TableHead>
              <TableHead className="h-11 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((b: BookingWithRelations) => {
              const totalAmount =
                b.payments?.reduce((sum, p) => sum + (p?.amount || 0), 0) || 0;
              return (
                <TableRow key={b.id}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={b.user?.profile?.avatar || ""} />
                      <AvatarFallback className="uppercase">
                        {b.user?.profile?.fullName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {b.user?.profile?.fullName || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getBookingStatusBadge(b.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {b.court?.name || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {totalAmount.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {b.bookingDate
                      ? new Date(b.bookingDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="border-none shadow-none"
                    >
                      <Trash className="size-4 text-[#A4A7AE]" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="border-none shadow-none"
                      onClick={() => {
                        setSelected(b);
                        setModalOpen(true);
                      }}
                    >
                      <Pencil className="size-4 text-[#A4A7AE]" />
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

      <BookingModal
        open={modalOpen}
        onChangeMode={setMode}
        onOpenChange={setModalOpen}
        bookingModalProps={{
          id: selected?.id || "",
          venue: selected?.court.venue.name || "",
          courtName: selected?.court.name || "",
          image: "",
          bookingTime: selected?.bookingDate?.toLocaleTimeString() || "",
          bookingDate: selected?.bookingDate?.toLocaleDateString() || "",
          duration: selected?.duration?.toString() || "",
          totalPayment: 0,
          status: selected?.status || "",
          paymentMethod: "",
          paymentStatus: "",
        }}
      />
    </div>
  );
}
