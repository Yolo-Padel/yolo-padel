"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Card, CardFooter, CardTitle } from "@/components/ui/card";
import { stringUtils } from "@/lib/format/string";
import { BookingStatus, PaymentStatus } from "@/types/prisma";

/**
 * Booking card row data structure
 * Transformed from API response for display
 */
export interface BookingCardRow {
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
}

interface BookingCardGridProps {
  bookings: BookingCardRow[];
  onViewDetails: (booking: BookingCardRow) => void;
  onBookAgain: () => void;
  onPayNow: (invoiceUrl: string) => void;
}

/**
 * Get status badge styling based on booking status
 */
function getStatusBadge(status: BookingStatus): string {
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

/**
 * Pure presentational component for booking card grid
 * Renders a grid of booking cards with actions
 */
export function BookingCardGrid({
  bookings,
  onViewDetails,
  onBookAgain,
  onPayNow,
}: BookingCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {bookings.map((booking) => (
        <Card
          className="gap-3 p-3 hover:shadow-xl transition-shadow duration-300"
          key={booking.id}
        >
          <div className="flex flex-col px-0">
            <Image
              src={booking.image || "/paddle-court1.svg"}
              alt=""
              className="flex-1 w-full aspect-square"
              width={500}
              height={500}
            />
          </div>
          <div className="flex flex-col text-md gap-1 px-2">
            <CardTitle className="text-xs truncate font-normal">
              <span className="justify-between flex items-center gap-1">
                ID: {booking.id}{" "}
                <Badge
                  className={`rounded-md px-3 py-1 text-xs font-medium ${getStatusBadge(booking.status)}`}
                >
                  {stringUtils.toTitleCase(booking.status)}
                </Badge>
              </span>
            </CardTitle>
            <div className="mt-0 justify-between flex items-center gap-1 text-sm">
              <span
                className="text-sm font-medium text-black truncate flex-1 min-w-0"
                title={`${booking.courtName} • ${booking.venue}`}
              >
                {booking.courtName} • {booking.venue}
              </span>
              <span className="flex-shrink-0">
                {new Date(booking.bookingDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="mt-0 flex items-center gap-1 justify-between text-sm">
              <span>{booking.bookingTime}</span>
              <span>{booking.duration}</span>
            </div>
            <div className="mt-0 flex items-center gap-1 justify-between text-sm">
              <span>Total Payment</span>
              <span>{stringUtils.formatRupiah(booking.totalPayment)}</span>
            </div>
          </div>

          {/* Action buttons based on status */}
          {booking.status === BookingStatus.COMPLETED && (
            <CardFooter className="px-1 pb-1 w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={() => onViewDetails(booking)}
                className="w-full border border-primary bg-primary/20 text-black hover:bg-primary/50"
                variant="outline"
              >
                See Details
              </Button>
              <Button
                className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={onBookAgain}
              >
                Book Again
              </Button>
            </CardFooter>
          )}
          {booking.status === BookingStatus.PENDING && (
            <CardFooter className="px-1 pb-1 w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={() => onViewDetails(booking)}
                className="w-full border border-primary bg-primary/20 text-black hover:bg-primary/50 "
                variant="outline"
              >
                See Details
              </Button>
              <Button
                className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={() => onPayNow(booking.invoiceUrl)}
              >
                Pay Now
              </Button>
            </CardFooter>
          )}
          {booking.status === BookingStatus.UPCOMING && (
            <CardFooter className="px-1 pb-1 w-full min-w-0">
              <Button
                onClick={() => onViewDetails(booking)}
                className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
              >
                See Details
              </Button>
            </CardFooter>
          )}
          {booking.status === BookingStatus.CANCELLED && (
            <CardFooter className="px-1 pb-1 w-full min-w-0">
              <Button
                className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={onBookAgain}
              >
                Book Again
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
