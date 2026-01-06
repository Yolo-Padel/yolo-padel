"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// Hooks
import { useBookingByUser } from "@/hooks/use-booking";
import { useCurrentUser } from "@/hooks/use-auth";
import { useUserBookingFilters } from "@/hooks/use-user-booking-filters";
import { usePaymentFeedback } from "@/hooks/use-payment-feedback";

// Components
import { BookingHeader } from "./_components/booking-header";
import {
  BookingCardGrid,
  type BookingCardRow,
} from "./_components/booking-card-grid";
import {
  BookingPagination,
  type BookingPaginationInfo,
} from "./_components/booking-pagination";
import { BookingEmptyState } from "./_components/booking-empty-state";
import { BookingErrorState } from "./_components/booking-error-state";
import BookingTableLoading from "./_components/booking-table-loading";
import { BookingModal } from "./_components/booking-modal";
import { BookingCourtModal } from "./_components/booking-court-modal";
import { PaymentFeedbackDialog } from "./_components/payment-feedback-dialog";

// Utils & Types
import { transformDbFormatToUISlots } from "@/lib/booking-slots-utils";
import {
  Booking,
  BookingStatus,
  PaymentStatus,
  Court,
  Venue,
  Payment,
  Order,
} from "@/types/prisma";

const PAGE_SIZE = 12;

/**
 * Transform API booking data to display format
 */
function transformBookingsToRows(
  bookings: (Booking & {
    order: Order & { payment: Payment };
    court: Court & { venue: Venue };
    timeSlots?: Array<{ openHour: string; closeHour: string }>;
  })[],
): BookingCardRow[] {
  return bookings.map((b) => {
    // Transform timeSlots to display format
    let bookingTime: string;
    if (b.timeSlots && b.timeSlots.length > 0) {
      bookingTime = transformDbFormatToUISlots(b.timeSlots).join(", ");
    } else if (b.bookingHour) {
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
      paymentMethod: b.order?.payment?.channelName || "N/A",
      paymentStatus: b.order?.payment?.status || PaymentStatus.UNPAID,
      invoiceUrl: b.order?.payment?.paymentUrl || "",
    };
  });
}

/**
 * Filter bookings by search query (client-side)
 */
function filterBookings(
  bookings: BookingCardRow[],
  search: string,
): BookingCardRow[] {
  const searchQuery = search.toLowerCase().trim();
  if (!searchQuery) return bookings;

  return bookings.filter((booking) =>
    booking.courtName.toLowerCase().includes(searchQuery),
  );
}

/**
 * Paginate bookings array
 */
function paginateBookings(
  bookings: BookingCardRow[],
  page: number,
  pageSize: number,
): BookingCardRow[] {
  const start = (page - 1) * pageSize;
  return bookings.slice(start, start + pageSize);
}

/**
 * BookingPage Container Component
 *
 * Orchestrates hooks and components following clean architecture pattern:
 * - Consumes hooks for state management and data fetching
 * - Handles user interactions via event handlers
 * - Composes presentational components
 * - Manages modal state
 */
export default function BookingPage() {
  // ═══════════════════════════════════════════════════════
  // Hooks
  // ═══════════════════════════════════════════════════════

  const { filters, setSearch, setPage, resetFilters, hasActiveFilters } =
    useUserBookingFilters();

  const { data: userData, isLoading: isLoadingUser } = useCurrentUser();
  const userId = userData?.data?.user.id || "";

  const {
    data,
    isLoading: isLoadingBookings,
    error,
  } = useBookingByUser(userId);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { paymentFeedback, setPaymentFeedback } =
    usePaymentFeedback(searchParams);

  // ═══════════════════════════════════════════════════════
  // Local UI State
  // ═══════════════════════════════════════════════════════

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<
    | "booking-details"
    | "order-summary"
    | "book-again"
    | "payment-paid"
    | "payment-pending"
    | "booking-payment"
  >("booking-details");
  const [selectedBooking, setSelectedBooking] = useState<BookingCardRow | null>(
    null,
  );
  const [bookCourtModalOpen, setBookCourtModalOpen] = useState(false);

  // ═══════════════════════════════════════════════════════
  // Data Transformation (Memoized)
  // ═══════════════════════════════════════════════════════

  const allBookings = useMemo(() => {
    const rawBookings =
      (data?.data as
        | (Booking & {
            order: Order & { payment: Payment };
            court: Court & { venue: Venue };
            timeSlots?: Array<{ openHour: string; closeHour: string }>;
          })[]
        | undefined) || [];
    return transformBookingsToRows(rawBookings);
  }, [data?.data]);

  const filteredBookings = useMemo(
    () => filterBookings(allBookings, filters.search),
    [allBookings, filters.search],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / PAGE_SIZE),
  );
  const safePage = Math.min(filters.page, totalPages);

  const paginatedBookings = useMemo(
    () => paginateBookings(filteredBookings, safePage, PAGE_SIZE),
    [filteredBookings, safePage],
  );

  const paginationInfo: BookingPaginationInfo = {
    currentPage: safePage,
    totalPages,
    totalItems: filteredBookings.length,
    displayedItems: paginatedBookings.length,
  };

  // ═══════════════════════════════════════════════════════
  // Loading States
  // ═══════════════════════════════════════════════════════

  const isLoading = isLoadingUser || isLoadingBookings;

  // ═══════════════════════════════════════════════════════
  // Event Handlers
  // ═══════════════════════════════════════════════════════

  const handleBookCourt = () => {
    setBookCourtModalOpen(true);
  };

  const handleViewDetails = (booking: BookingCardRow) => {
    setSelectedBooking(booking);
    setModalOpen(true);
    setMode("booking-details");
  };

  const handleBookAgain = () => {
    setBookCourtModalOpen(true);
  };

  const handlePayNow = (invoiceUrl: string) => {
    window.open(invoiceUrl, "_blank");
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleViewOrderHistory = () => {
    router.push("/dashboard/order-history");
  };

  const clearPaymentFeedback = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("paymentStatus");
    params.delete("paymentId");
    params.delete("reason");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
    setPaymentFeedback(null);
  };

  // ═══════════════════════════════════════════════════════
  // Conditional Rendering
  // ═══════════════════════════════════════════════════════

  // Initial loading state
  if (isLoading) {
    return <BookingTableLoading />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <BookingHeader onBookCourt={handleBookCourt} />
        <BookingErrorState message={error.message} />
        <BookingCourtModal
          open={bookCourtModalOpen}
          onOpenChange={setBookCourtModalOpen}
          onClose={() => setBookCourtModalOpen(false)}
        />
      </div>
    );
  }

  // Empty state
  if (filteredBookings.length === 0) {
    return (
      <>
        <div className="flex flex-col gap-4">
          <BookingHeader onBookCourt={handleBookCourt} />
          <BookingEmptyState onBookCourt={handleBookCourt} />
        </div>
        <BookingCourtModal
          open={bookCourtModalOpen}
          onOpenChange={setBookCourtModalOpen}
          onClose={() => setBookCourtModalOpen(false)}
        />
        <PaymentFeedbackDialog
          feedback={paymentFeedback}
          onClose={clearPaymentFeedback}
          onViewOrders={handleViewOrderHistory}
        />
      </>
    );
  }

  // ═══════════════════════════════════════════════════════
  // Main Render
  // ═══════════════════════════════════════════════════════

  return (
    <>
      <div className="flex flex-col gap-4">
        <BookingHeader onBookCourt={handleBookCourt} />

        <BookingCardGrid
          bookings={paginatedBookings}
          onViewDetails={handleViewDetails}
          onBookAgain={handleBookAgain}
          onPayNow={handlePayNow}
        />

        <BookingPagination
          paginationInfo={paginationInfo}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modals */}
      <BookingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        bookingModalProps={selectedBooking}
        mode={mode}
        onChangeMode={setMode}
      />
      <BookingCourtModal
        open={bookCourtModalOpen}
        onOpenChange={setBookCourtModalOpen}
        onClose={() => setBookCourtModalOpen(false)}
      />
      <PaymentFeedbackDialog
        feedback={paymentFeedback}
        onClose={clearPaymentFeedback}
        onViewOrders={handleViewOrderHistory}
      />
    </>
  );
}
