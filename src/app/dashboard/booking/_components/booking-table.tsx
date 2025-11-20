"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandPlot } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { useBookingByUser } from "@/hooks/use-booking";
import { BookingEmptyState } from "./booking-empty-state";
import { DatePicker } from "@/components/ui/date-picker";
import ComboboxFilter from "@/components/ui/combobox";
import BookingTableLoading from "./booking-table-loading";
import { stringUtils } from "@/lib/format/string";
import {
  Booking,
  BookingStatus,
  PaymentStatus,
  Court,
  Venue,
  Payment,
  Order,
} from "@/types/prisma";
import { useCurrentUser } from "@/hooks/use-auth";
import { BookingModal } from "./booking-modal";
import { transformDbFormatToUISlots } from "@/lib/booking-slots-utils";
import { BookingCourtModal } from "./booking-court-modal";
import {
  PaymentFeedbackDialog,
  PaymentFeedbackState,
} from "./payment-feedback-dialog";

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
  invoiceUrl: string;
};

const PAGE_SIZE = 12;

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
  const [paymentFeedback, setPaymentFeedback] =
    useState<PaymentFeedbackState | null>(null);
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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const statusParam = searchParams.get("paymentStatus");
    const paymentIdParam = searchParams.get("paymentId");
    const reason = searchParams.get("reason") || undefined;

    if (
      !statusParam ||
      !paymentIdParam ||
      (statusParam !== "success" && statusParam !== "failed")
    ) {
      setPaymentFeedback(null);
      return;
    }

    let cancelled = false;

    setPaymentFeedback({
      status: statusParam as "success" | "failed",
      reason,
      paymentId: paymentIdParam,
      loading: true,
    });

    const fetchPayment = async () => {
      try {
        const response = await fetch(`/api/payment/${paymentIdParam}/status`, {
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || "Failed to fetch payment");
        }

        const data = await response.json();
        if (!data.success || !data.data) {
          throw new Error("Payment not found");
        }

        if (!cancelled) {
          setPaymentFeedback((prev) =>
            prev && prev.paymentId === paymentIdParam
              ? { ...prev, payment: data.data, loading: false }
              : {
                  status: statusParam as "success" | "failed",
                  reason,
                  paymentId: paymentIdParam,
                  payment: data.data,
                  loading: false,
                }
          );
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to fetch payment";
          setPaymentFeedback((prev) =>
            prev && prev.paymentId === paymentIdParam
              ? { ...prev, error: message, loading: false }
              : {
                  status: statusParam as "success" | "failed",
                  reason,
                  paymentId: paymentIdParam,
                  loading: false,
                  error: message,
                }
          );
        }
      }
    };

    fetchPayment();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

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

  const handleViewOrderHistory = () => {
    router.push("/dashboard/order-history");
    clearPaymentFeedback();
  };

  const getStatusBadge = (status: BookingStatus) => {
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
  };

  const allBookingCourts =
    (data?.data as
      | (Booking & {
          order: Order & { payment: Payment };
          court: Court & { venue: Venue };
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
        paymentMethod: b.order?.payment?.channelName || "N/A",
        paymentStatus: b.order?.payment?.status || PaymentStatus.UNPAID,
        invoiceUrl: b.order?.payment?.paymentUrl || "",
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
            className="font-normal bg-[#C3D223] hover:bg-[#A9B920] text-black"
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
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-1">
          <h3 className="text-xl font-semibold">Booking Court List</h3>
          <div className="flex items-center gap-2">
            <DatePicker />
            <ComboboxFilter />

            <Button
              onClick={() => setBookCourtModalOpen(true)}
              className="text-black"
            >
              Book Court
              <LandPlot className="size-4" />
            </Button>
          </div>
        </div>
        {filtered.length === 0 ? (
          <BookingEmptyState onBookCourt={() => setBookCourtModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginated.map((bookingCourt) => (
              <Card
                className="gap-3 p-3 hover:shadow-xl transition-shadow duration-300"
                key={bookingCourt.id}
              >
                <div className="flex flex-col px-0">
                  <Image
                    src={bookingCourt.image || "/paddle-court1.svg"}
                    alt=""
                    className="flex-1 w-full aspect-square"
                    width={500}
                    height={500}
                  />
                </div>
                <div className="flex flex-col text-md gap-1 px-2">
                  <CardTitle className="text-xs truncate font-normal">
                    <span className="justify-between flex items-center gap-1">
                      ID: #{bookingCourt.id}{" "}
                      <Badge
                        className={`rounded-md px-3 py-1 text-xs font-medium ${getStatusBadge(bookingCourt.status)}`}
                      >
                        {stringUtils.toTitleCase(bookingCourt.status)}
                      </Badge>
                    </span>
                  </CardTitle>
                  <div className="mt-0 justify-between flex items-center gap-1 text-sm">
                    <span
                      className="text-sm font-medium text-black truncate flex-1 min-w-0"
                      title={`${bookingCourt.courtName} • ${bookingCourt.venue}`}
                    >
                      {bookingCourt.courtName} • {bookingCourt.venue}
                    </span>{" "}
                    <span className="flex-shrink-0">
                      {" "}
                      {new Date(bookingCourt.bookingDate).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  <div className="mt-0 flex items-center gap-1 justify-between text-sm">
                    <span>{bookingCourt.bookingTime}</span>{" "}
                    <span>{bookingCourt.duration}</span>
                  </div>
                  <div className="mt-0 flex items-center gap-1 justify-between text-sm">
                    <span>Total Payment</span>{" "}
                    <span>
                      {stringUtils.formatRupiah(bookingCourt.totalPayment)}
                    </span>
                  </div>
                </div>

                {bookingCourt.status === BookingStatus.COMPLETED && (
                  <CardFooter className="px-1 pb-1 w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      onClick={() => {
                        setSelectedBookingCourt(bookingCourt);
                        setMode("booking-details");
                      }}
                      className="w-full border-primary"
                      variant="outline"
                    >
                      See Details
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => setBookCourtModalOpen(true)}
                    >
                      Book Again
                    </Button>
                  </CardFooter>
                )}
                {bookingCourt.status === BookingStatus.PENDING && (
                  <CardFooter className="px-1 pb-1 w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      onClick={() => {
                        setSelectedBookingCourt(bookingCourt);
                        setModalOpen(true);
                        setMode("booking-details");
                      }}
                      className="w-full border-primary"
                      variant="outline"
                    >
                      See Details
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => {
                        window.open(bookingCourt.invoiceUrl, "_blank");
                      }}
                    >
                      Pay Now
                    </Button>
                  </CardFooter>
                )}
                {bookingCourt.status === BookingStatus.UPCOMING && (
                  <CardFooter className="px-1 pb-1 w-full min-w-0">
                    <Button
                      onClick={() => {
                        setSelectedBookingCourt(bookingCourt);
                        setModalOpen(true);
                        setMode("booking-details");
                      }}
                      className="w-full"
                    >
                      See Details
                    </Button>
                  </CardFooter>
                )}
                {bookingCourt.status === BookingStatus.CANCELLED && (
                  <CardFooter className="px-1 pb-1 w-full min-w-0">
                    <Button
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
      <PaymentFeedbackDialog
        feedback={paymentFeedback}
        onClose={clearPaymentFeedback}
        onViewOrders={handleViewOrderHistory}
      />
    </>
  );
}
