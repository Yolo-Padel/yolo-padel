"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandPlot } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useBookingByUser } from "@/hooks/use-booking";
import { BookingEmptyState } from "./booking-empty-state";
import { DatePicker } from "@/components/ui/date-picker";
import ComboboxFilter from "@/components/ui/combobox";
import BookingTableLoading from "./booking-table-loading";
import {
  Booking,
  BookingStatus,
  PaymentStatus,
  Court,
  Venue,
  Payment,
} from "@/types/prisma";
import { useCurrentUser } from "@/hooks/use-auth";
import { BookingModal } from "./booking-modal";
import { transformDbFormatToUISlots } from "@/lib/booking-slots-utils";
import { BookingCourtModal } from "./booking-court-modal";

type BookingCourtRow = {
  id: string;
  venue: string;
  courtName: string;
  image?: string;
  bookingTime?: string;
  bookingDate: string;
  duration: string;
  totalPayment: number;
  status: BookingStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
};

const PAGE_SIZE = 10;

export function BookingCourt() {
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<
    | "booking-details"
    | "order-summary"
    | "book-again"
    | "payment-paid"
    | "payment-pending"
    | "booking-payment"
  >("booking-details");
  const [page, setPage] = useState(1);
  const [bookCourtModalOpen, setBookCourtModalOpen] = useState(false);
  const [selectedBookingCourt, setSelectedBookingCourt] =
    useState<BookingCourtRow | null>(null);
  const { data: userData, isLoading: isLoadingUser } = useCurrentUser();
  const userId = userData?.data?.user.id || "";
  const {
    data,
    isLoading: isLoadingBookings,
    error,
  } = useBookingByUser(userId);

  // Show loading if user is still loading OR bookings are loading
  const isLoading = isLoadingUser || isLoadingBookings;
  const router = useRouter();
  const searchParams = useSearchParams();

  const getStatusBadge = (
    status: string | "Upcoming" | "Expired" | "Completed"
  ) => {
    switch (status) {
      case "Upcoming":
        return "bg-[#D5F1FF] text-[#1F7EAD]";
      case "Expired":
        return "bg-[#FFD5D5] text-[#AD1F1F]";
      case "Completed":
        return "bg-[#D5FFD5] text-[#1FAD53]";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const allBookingCourts =
    (data?.data as
      | (Booking & {
          court: Court & { venue: Venue };
          payments: Payment[];
          timeSlots?: Array<{ openHour: string; closeHour: string }>;
        })[]
      | undefined) || [];

  const rows: BookingCourtRow[] = useMemo(() => {
    return allBookingCourts.map((b) => {
      // Transform timeSlots to display format
      let bookingTime: string;
      if (b.timeSlots && b.timeSlots.length > 0) {
        // Multiple slots: join with comma
        bookingTime = transformDbFormatToUISlots(b.timeSlots).join(", ");
      } else if (b.bookingHour) {
        // Backward compatibility: use bookingHour
        bookingTime = b.bookingHour;
      } else {
        bookingTime = "N/A";
      }

      return {
        id: b.bookingCode,
        venue: b.court.venue.name,
        courtName: b.court.name,
        image: b.court.image || "/paddle-court1.svg",
        bookingTime,
        bookingDate: new Date(b.bookingDate).toISOString().split("T")[0],
        duration: b.duration.toString() + " Hours",
        totalPayment: b.totalPrice,
        status: b.status,
        paymentMethod: b.payments[0]?.channelName || "N/A",
        paymentStatus: b.payments[0]?.status || "PENDING",
      };
    });
  }, [allBookingCourts]);

  // Frontend filtering and pagination
  const filtered = useMemo(() => {
    const searchQuery = searchParams.get("search")?.toLowerCase().trim();

    if (!searchQuery) {
      return rows;
    }

    return rows.filter((bookingCourt: BookingCourtRow) => {
      const courtName = bookingCourt.courtName.toLowerCase();

      return courtName.includes(searchQuery);
    });
  }, [rows, searchParams]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageSafe]);

  // Show loading state first (before checking error or empty state)
  if (isLoading) {
    return <BookingTableLoading />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-1">
          <h3 className="text-xl font-semibold">Booking Court List</h3>
          <Button
            variant="outline"
            onClick={() => setBookCourtModalOpen(true)}
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
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-1">
        <h3 className="text-xl font-semibold ">Booking Court List</h3>
        <div className="flex items-center gap-2">
          <DatePicker />
          <ComboboxFilter />

          <Button
            variant="outline"
            onClick={() => setBookCourtModalOpen(true)}
            className="font-normal bg-[#C3D223] hover:bg-[#A9B920] text-black rounded-sm"
          >
            Book Court
            <LandPlot className="size-4" />
          </Button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <BookingEmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {paginated.map((bookingCourt) => (
            <Card
              className="min-w-0 max-w-[265px] shadow-lg hover:shadow-xl transition-shadow duration-300 p-1 gap-2 border-[1px] border-foreground"
              key={bookingCourt.id}
            >
              <CardHeader className="p-2">
                <img
                  src={bookingCourt.image}
                  className="w-full h-full object-cover rounded-sm"
                />
              </CardHeader>
              <CardContent className="px-2 pt-0 pb-1 text-md text-gray-700 gap-2 space-y-2">
                <CardTitle className="text-md font-semibold truncate">
                  <span className="justify-between flex items-center gap-1">
                    {bookingCourt.id}{" "}
                    <Badge className={getStatusBadge(bookingCourt.status)}>
                      <p className="capitalize">{bookingCourt.status}</p>
                    </Badge>
                  </span>
                </CardTitle>
                <div className="mt-0 justify-between flex items-center gap-1 text-sm">
                  <span>{bookingCourt.courtName}</span>{" "}
                  <span> {bookingCourt.bookingDate}</span>
                </div>
                <div className="mt-0 flex items-center gap-1 justify-between text-sm">
                  <span>{bookingCourt.bookingTime}</span>{" "}
                  <span>{bookingCourt.duration}</span>
                </div>
                <div className="mt-0 flex items-center gap-1 justify-between text-sm">
                  <span>Total Payment</span>{" "}
                  <span>Rp {bookingCourt.totalPayment}</span>
                </div>
              </CardContent>

              {bookingCourt.status === BookingStatus.COMPLETED && (
                <CardFooter className="px-1 pt-4 pb-1 w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      setSelectedBookingCourt(bookingCourt);
                      setMode("booking-details");
                    }}
                    variant="outline"
                    size="sm"
                    className="rounded-sm border-[#C3D223] text-black w-full"
                  >
                    See Details
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => setBookCourtModalOpen(true)}
                  >
                    Book Again
                  </Button>
                </CardFooter>
              )}
              {bookingCourt.status === BookingStatus.CONFIRMED && (
                <CardFooter className="px-1 pt-4 pb-1 w-full min-w-0">
                  <Button
                    onClick={() => {
                      setSelectedBookingCourt(bookingCourt);
                      setModalOpen(true);
                      setMode("booking-details");
                    }}
                    variant="default"
                    size="sm"
                    className="w-full"
                  >
                    See Details
                  </Button>
                </CardFooter>
              )}
              {bookingCourt.status === BookingStatus.CANCELLED && (
                <CardFooter className="px-1 pt-4 pb-1 w-full min-w-0">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => setBookCourtModalOpen(true)}
                  >
                    Book Again
                  </Button>
                </CardFooter>
              )}
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
      {/*Modal*/}
      <BookingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        bookingModalProps={selectedBookingCourt}
        mode={mode}
        onChangeMode={setMode}
      />
      <BookingCourtModal
        open={bookCourtModalOpen}
        onOpenChange={setBookCourtModalOpen}
        onClose={() => setBookCourtModalOpen(false)}
      />
    </div>
  );
}
