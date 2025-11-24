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


type CancelBookingDetailsProps = {
  id: string;
  venue: string;
  courtName: string;
  bookingTime?: string;
  bookingDate: string;
  duration: string;
  status: BookingStatus;
};

export function cancelBookingDetail ({
  open,
  onOpenChange,
  cancelBookingDetail,

}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    cancelBookingDetail: CancelBookingDetailsProps | null;
}) {
  return (
    <div className="p-4 rounded-md bg-[#FFF4D5] text-[#8B6F00]">
      <div className="flex items-center justify-center">
        <XIcon className="w-6 h-6 mr-2" />
        <span className="font-bold">Booking ID: {cancelBookingDetail?.id || ""} </span>
      </div>
      <div className="mt-2">
        <span className="font-bold">Venue:</span> {cancelBookingDetail?.venue || ""}
      </div>
      <div className="mt-2">
        <span className="font-bold">Court:</span> {cancelBookingDetail?.courtName || ""}
      </div>
      <div className="mt-2">
        <span className="font-bold">Date:</span> {cancelBookingDetail?.bookingTime || ""}
      </div>
      <div className="mt-2">
        <span className="font-bold">Time:</span> {cancelBookingDetail?.bookingDate || ""}
      </div>
      <div className="mt-2">
        <span className="font-bold">Duration:</span> {cancelBookingDetail?.duration || ""}
      </div>

      <div className="flex justify-between items-center">
        <Button
          onClick={() => onOpenChange(false)}
          className="w-full p-4 rounded-sm"
        >
          Keep Booking
        </Button>
        <Button
          onClick={() => onOpenChange(false)}
          className="w-full p-4 rounded-sm"
        >
          Cancel
        </Button>
      </div>
    </div>
  )}
