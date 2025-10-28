"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Bell, Dot, LandPlot, LayoutGrid, User } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Pencil, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Court } from "@prisma/client";
import { useCourt } from "@/hooks/use-court";
import { BookingEmptyState } from "./booking-empty-state";
import { DatePicker } from "@/components/ui/date-picker";
import ComboboxFilter from "@/components/ui/combobox";

type BookingCourtRow = {
  id: string;
  venue: string;
  courtName: string;
  image?: string;
  playingHours?: string;
  bookingDate: string;
  bookingTime: string;
  totalPayment: number;
  status: string | "UPCOMING" | "CANCELLED" | "COMPLETED";
};


const PAGE_SIZE = 10;

export function BookingCourt() {
  const [page, setPage] = React.useState(1);
  const [addSheetOpen, setAddBookingCourtOpen] = React.useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);
  const [selectedBookingCourt, setSelectedBookingCourt] = React.useState<BookingCourtRow | null>(null);
  const [editSheetOpen, setEditSheetOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);  
  const { data, isLoading, error } = useCourt();
  const router = useRouter();
  const searchParams = useSearchParams();

  const getStatusBadge = (status: string | "UPCOMING" | "EXPIRED" | "COMPLETED") => {
    switch (status) {
      case "UPCOMING":
        return "bg-[#D5F1FF] text-[#1F7EAD]";
      case "EXPIRED":
        return "bg-[#FFD5D5] text-[#AD1F1F]";
      case "COMPLETED":
        return "bg-[#D5FFD5] text-[#1FAD53]";
      default:
        return "bg-gray-500 text-white";
    }
  }
  const allBookingCourts = (data?.data as BookingCourtRow[] | undefined) || [];

  const rows: BookingCourtRow[] = React.useMemo(() => {
    return allBookingCourts.map((b) => ({
        id: "3rfwrwr3",
        venue: "Slipi",
        courtName: "Court 3",
        image: "/paddle-court1.svg",
        playingHours: "06:00 - 07:00",
        bookingDate: "14 OKT 2025", // fallback placeholder
        bookingTime: "1 Hours", // fallback placeholder
        totalPayment: 600000,
        status: "COMPLETED",
    
  }));
  }, [allBookingCourts]);

  // Frontend filtering and pagination
  const filtered = useMemo(() => {
    const searchQuery = searchParams.get("search")?.toLowerCase().trim()
    
    if (!searchQuery) {
      return rows
    }

    return rows.filter((bookingCourt: BookingCourtRow) => {
      const courtName = bookingCourt.courtName.toLowerCase()
      
      return (
        courtName.includes(searchQuery)
      )
    })
  }, [rows, searchParams])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paginated = React.useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageSafe]);


  async function handleSubmit() {
    // Dummy submit: console log value
    console.log("");
  }

  async function handleEditDetailsVenue() {
    console.log("Edit Details");
    setDetailSheetOpen(false);
  }

  function handleEditVenue() {
    console.log("Edit Venue clicked");
    setEditSheetOpen(true);
  }

  function handleDeleteVenue() {
    console.log("Delete Venue clicked");
    // Close details modal first
    setDetailSheetOpen(false);
    // Then open delete modal
    setDeleteModalOpen(true);
  }
  {/* Delete Booking Court Modal 
  function handleDeleteSuccess() {
    setSelectedBookingCourt(null);
    setDeleteModalOpen(false);
    setDetailSheetOpen(false);
    // The useVenue hook will automatically refetch data
  } */}

  {/* Delete Booking Court Modal 
  function handleDeleteCancel() {
    setDeleteModalOpen(false);
    // Reopen details modal if user cancels delete
    setDetailSheetOpen(true);
  } */}

  // Show loading state
 {/*loadingState
  if (isLoading) {
    return (
      <BookingCourtTableSkeleton />
    )
  }
*/}

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-1">
          <h3 className="text-xl font-semibold">Booking Court List</h3>
          <Button
            variant="outline"
            onClick={() => setAddBookingCourtOpen(true)}
            className="font-normal bg-[#C3D223] hover:bg-[#A9B920] text-black rounded-sm"
          >
            Book Court
            <LandPlot className="mr-2 size-4" />
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 mb-2">Error loading booking</div>
            <p className="text-gray-500">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-1">
        <h3 className="text-xl font-semibold ">Booking Court List</h3>
        <div className="flex items-center gap-2">
            <DatePicker/>
            <ComboboxFilter/>

          <Button
            variant="outline"
            onClick={() => setAddBookingCourtOpen(true)}
            className="font-normal bg-[#C3D223] hover:bg-[#A9B920] text-black rounded-sm"
          >
            Book Court
            <LandPlot className="size-4" />
          </Button>
        </div>
      </div>
      {filtered.length === 1 ? (
        <BookingEmptyState />
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
      {paginated.map((bookingCourt) => (
      <Card className="min-w-0 max-w-[265px] shadow-lg hover:shadow-xl transition-shadow duration-300 p-1 gap-2" key={bookingCourt.id}>
        <CardHeader className="p-2">
            <img
              src={bookingCourt.image}
              className="w-full h-full object-cover rounded-sm"
            />
        </CardHeader>
        <CardContent className="px-2 pt-0 pb-1 text-md text-gray-700 gap-2 space-y-2">
              <CardTitle className="text-md font-semibold truncate">
                <span className="justify-between flex items-center gap-1">
                ID#{bookingCourt.id} <Badge className={getStatusBadge(bookingCourt.status)}>{bookingCourt.status}</Badge>
                </span>
              </CardTitle>
              <div className="mt-0 justify-between flex items-center gap-1 text-sm">
                <span>{bookingCourt.courtName}</span> <span> {bookingCourt.bookingDate}</span>
              </div>
              <div className="mt-0 flex items-center gap-1 justify-between text-sm">
                <span>{bookingCourt.playingHours}</span> <span>{bookingCourt.bookingTime}</span>
              </div>
              <div className="mt-0 flex items-center gap-1 justify-between text-sm">
                <span>Total Payment</span> <span>Rp {bookingCourt.totalPayment}</span>
              </div>
            </CardContent>
        <CardFooter className="px-1 pt-4 pb-1 w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={() => { setSelectedBookingCourt(bookingCourt); setDetailSheetOpen(true); }}
            variant="outline"
            size="sm"
            className="rounded-sm border-[#C3D223] text-black w-full"
          >
            See Details
          </Button>
          <Button
            variant="default"
            size="sm"
            className="rounded-sm bg-[#C3D223] hover:bg-[#A9B920] text-black w-full"
            onClick={() => router.push(`/admin/dashboard/court?bookingCourtId=${bookingCourt.id}`)}
          >
            Book Again
          </Button>
        </CardFooter>
      </Card>
      ))}
      </div>
      )}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {paginated.length} of {filtered.length} booking courts
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={pageSafe <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {pageSafe} / {totalPages}
          </div>
          <Button
            variant="outline"
            disabled={pageSafe >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
