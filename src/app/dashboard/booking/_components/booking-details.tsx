"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, XIcon } from "lucide-react";
import { BookingStatus } from "@/types/prisma";
{
  /*Import Modal*/
}
import { stringUtils } from "@/lib/format/string";

type BookingDetails = {
  id: string;
  venue: string;
  courtName: string;
  image?: string;
  bookingTime?: string;
  bookingDate: string;
  duration: string;
  status: BookingStatus;
};

const getStatusBadge = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.PENDING:
      return "bg-[#FFF4D5] text-[#8B6F00]";
    case BookingStatus.CANCELLED:
      return "bg-[#FFD5D5] text-[#AD1F1F]";
    case BookingStatus.COMPLETED:
      return "bg-[#D5FFD5] text-[#1FAD53]";
    case BookingStatus.UPCOMING:
      return "bg-[#D5F1FF] text-[#1F7EAD]";
    case BookingStatus.NO_SHOW:
      return "bg-[#E0E0E0] text-[#666666]";
    default:
      return "bg-gray-500 text-white";
  }
};

export function SeeBookingDetails({
  open,
  onOpenChange,
  bookingDetails,
  onChangeMode,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bookingDetails: BookingDetails | null;
  onChangeMode: (mode: "booking-details" | "book-again") => void;
}) {
  return (
    <div className="space-y-8">
      {/*Header*/}
      <div className="flex justify-between">
        <div className="space-y-2 font-bold text-2xl">
          Booking Details{" "}
          <Badge
            className={
              getStatusBadge(bookingDetails?.status || BookingStatus.PENDING) +
              " ml-1 rounded-md"
            }
          >
            <span className="text-xs">
              {stringUtils.toTitleCase(
                bookingDetails?.status || BookingStatus.PENDING
              )}
            </span>
          </Badge>
          <br />
          <p className="text-xs text-gray-500 font-normal">
            View all information related to your booking.
          </p>
        </div>
        <XIcon
          className="top-4 right-4 cursor-pointer bg-primary rounded-full p-2 size-8"
          onClick={() => onOpenChange(false)}
        />
      </div>
      {/*Body Content*/}
      <div className="space-y-7">
        <div className="mt-2 grid grid-cols-2 gap-y-2 text-sm">
          <div>Booking ID</div>
          <div className="font-medium text-foreground min-w-0">
            #{bookingDetails?.id || "-"}
          </div>

          <div>Court Name</div>
          <div className="font-medium text-foreground min-w-0">
            {bookingDetails?.courtName || "-"}
          </div>

          <div>Venue</div>
          <div className="font-medium text-foreground min-w-0">
            {bookingDetails?.venue || "-"}
          </div>

          <div>Booking Date</div>
          <div className="font-medium text-foreground min-w-0">
            {new Date(bookingDetails?.bookingDate || "").toLocaleDateString(
              "en-US",
              {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            ) || "-"}
          </div>

          <div>Booking Time</div>
          <div className="font-medium text-foreground min-w-0">
            {bookingDetails?.bookingTime || "-"}
          </div>

          <div>Duration</div>
          <div className="font-medium text-foreground min-w-0">
            {bookingDetails?.duration || "-"}
          </div>
        </div>

        <div>
          {bookingDetails?.status === BookingStatus.UPCOMING && (
            <Badge className="rounded-md bg-[#ECF1BB] text-[#6B7413] p-4 text-sm font-normal">
              <Info className="w-6 h-6 mr-2 mb-5" /> Please arrive at least
              10-15 minutes before your booking time to ensure a smooth check-in
              and warm-up.
            </Badge>
          )}

          {bookingDetails?.status === BookingStatus.COMPLETED && (
            <Badge className="rounded-md bg-[#ECF1BB] text-[#6B7413] p-4 text-sm font-normal">
              <Info className="w-6 h-6 mr-2 mb-5" /> Thanks for playing with us!
              If you enjoyed this session, feel free to book again at the same
              venue.
            </Badge>
          )}
        </div>
        {bookingDetails?.status === BookingStatus.UPCOMING && (
          <div>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full p-4 rounded-sm"
            >
              Close
            </Button>
          </div>
        )}
        {bookingDetails?.status === BookingStatus.PENDING && (
          <div>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full p-4 rounded-sm"
            >
              Close
            </Button>
          </div>
        )}
        {bookingDetails?.status === BookingStatus.COMPLETED && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center justify-center">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="w-full p-4 rounded-sm"
            >
              Close
            </Button>
            <Button
              onClick={() => onChangeMode("book-again")}
              className="w-full p-4 rounded-sm"
            >
              Book Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
