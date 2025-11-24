"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Info, XIcon } from "lucide-react";
{
  /*Import Modal*/
}
import { stringUtils } from "@/lib/format/string";


type CancelBookingDetailProps = {
  id: string;
  venue: string;
  courtName: string;
  bookingTime?: string;
  bookingDate: string;
  duration: string;
  
};

export function CancelBookingDetail ({
  open,
  onOpenChange,
  cancelBookingDetail,

}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    cancelBookingDetail: CancelBookingDetailProps | null;
}) {
  return (
    <div className="p-4 rounded-md bg-[#FFF4D5] text-[#8B6F00]">
      <div className="flex flex-col">
        <span>Cancel Booking</span> 
        <span className="text-sm">
          This action will permanently cancel this booking. Please review the details before confirming.
        </span>
      </div>
      <div className="mt-2 space-y-2">
        <span>Venue</span>
        <span>Court</span>
        <span>Date</span>
        <span>Time</span>
        <span>Duration</span>
      </div>
      <div className="mt-2 space-y-2 font-medium">
        <span>{cancelBookingDetail?.venue || ""}</span>
        <span>{cancelBookingDetail?.courtName || ""}</span>
        <span>{cancelBookingDetail?.bookingDate || ""}</span>
        <span>{cancelBookingDetail?.bookingTime || ""}</span>
        <span>{cancelBookingDetail?.duration || ""}</span>
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
