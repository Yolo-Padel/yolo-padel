"use client";

import { useMemo, useState } from "react";
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
import { BookingStatus, PaymentStatus, BookingTimeSlot } from "@/types/prisma";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BookingRow = {
  id: string;
  bookingCode: string;
  userName: string;
  venueName: string;
  courtName: string;
  bookingDate: Date;
  timeSlots: Pick<BookingTimeSlot, "openHour" | "closeHour">[];
  duration: number;
  totalPrice: number;
  channelName: string;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  createdAt: Date;
};

const PAGE_SIZE = 10;

function formatTimeDisplay(time: string): string {
  return time.replace(":", ".");
}

function formatTimeRange(
  timeSlots: Pick<BookingTimeSlot, "openHour" | "closeHour">[]
): string {
  if (timeSlots.length === 0) return "";
  const first = timeSlots[0];
  const last = timeSlots[timeSlots.length - 1];
  return `${formatTimeDisplay(first.openHour)}-${formatTimeDisplay(last.closeHour)}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
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

function makeDummyBookings(): BookingRow[] {
  const base: Omit<BookingRow, "id" | "bookingCode" | "createdAt">[] = [
    {
      userName: "Ari",
      venueName: "Yolo Padel Jakarta",
      courtName: "Court A",
      bookingDate: new Date(2025, 9, 14),
      timeSlots: [{ openHour: "06:00", closeHour: "07:00" }],
      duration: 1,
      totalPrice: 150000,
      channelName: "QRIS",
      paymentStatus: "PAID",
      status: "CONFIRMED",
    },
    {
      userName: "Budi",
      venueName: "Yolo Padel Jakarta",
      courtName: "Court B",
      bookingDate: new Date(2025, 9, 15),
      timeSlots: [
        { openHour: "07:00", closeHour: "08:00" },
        { openHour: "08:00", closeHour: "09:00" },
      ],
      duration: 2,
      totalPrice: 300000,
      channelName: "Bank Transfer",
      paymentStatus: "PENDING",
      status: "PENDING",
    },
    {
      userName: "Citra",
      venueName: "Yolo Padel Bandung",
      courtName: "Court 1",
      bookingDate: new Date(2025, 9, 16),
      timeSlots: [{ openHour: "18:00", closeHour: "19:00" }],
      duration: 1,
      totalPrice: 180000,
      channelName: "QRIS",
      paymentStatus: "FAILED",
      status: "CANCELLED",
    },
    {
      userName: "Dewi",
      venueName: "Yolo Padel Bandung",
      courtName: "Court 2",
      bookingDate: new Date(2025, 9, 17),
      timeSlots: [{ openHour: "20:00", closeHour: "21:00" }],
      duration: 1,
      totalPrice: 200000,
      channelName: "QRIS",
      paymentStatus: "EXPIRED",
      status: "NO_SHOW",
    },
    {
      userName: "Eka",
      venueName: "Yolo Padel Surabaya",
      courtName: "Court X",
      bookingDate: new Date(2025, 9, 18),
      timeSlots: [{ openHour: "09:00", closeHour: "10:00" }],
      duration: 1,
      totalPrice: 160000,
      channelName: "Bank Transfer",
      paymentStatus: "PAID",
      status: "COMPLETED",
    },
  ];

  const rows: BookingRow[] = [];
  for (let i = 0; i < 24; i++) {
    const b = base[i % base.length];
    rows.push({
      id: `b-${i + 1}`,
      bookingCode: `BK-${2025}${String(i + 1).padStart(4, "0")}`,
      createdAt: new Date(2025, 9, 10, 14, 7),
      ...b,
    });
  }
  return rows;
}

export function BookingTable() {
  const [page, setPage] = useState(1);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<BookingRow | null>(null);
  const searchParams = useSearchParams();

  const allBookings = useMemo(() => makeDummyBookings(), []);

  const filtered = useMemo(() => {
    const q = searchParams.get("search")?.toLowerCase().trim();
    if (!q) return allBookings;
    return allBookings.filter((b) => {
      return (
        b.bookingCode.toLowerCase().includes(q) ||
        b.userName.toLowerCase().includes(q) ||
        b.courtName.toLowerCase().includes(q) ||
        b.venueName.toLowerCase().includes(q) ||
        b.channelName.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q) ||
        b.paymentStatus.toLowerCase().includes(q)
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Booking List</h2>
          <Badge className="text-[#6941C6] bg-[#F9F5FF] border-[#E9D7FE] shadow-none rounded-4xl">
            {allBookings.length} bookings
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
            {paginated.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{b.bookingCode}</span>
                    <span className="text-xs text-muted-foreground">
                      {b.courtName} · {b.venueName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{b.userName}</TableCell>
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
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getPaymentStatusBadgeClass(b.paymentStatus)}`}
                    >
                      {b.paymentStatus === "PAID" ? "Paid" : b.paymentStatus}
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
            ))}
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
    </div>
  );
}
