"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge';
import { Info, XIcon } from 'lucide-react';
{/*Import Modal*/}  

type BookingDetails = {
  id: string;
  venue: string;
  courtName: string;
  image?: string;
  bookingTime?: string;
  bookingDate: string;
  duration: string;
  totalPayment: number;
  status: string | "Upcoming" | "Cancelled" | "Completed";
  paymentMethod: string | "Credit Card" | "PayPal" | "Bank Transfer";
  paymentStatus: string | "Paid" | "Unpaid";
};

const getStatusBadge = (status: string | "Upcoming" | "Cancelled" | "Completed") => {
      switch (status) {
        case "Upcoming":
          return "bg-[#D5F1FF] text-[#1F7EAD]";
        case "Cancelled":
          return "bg-[#FFD5D5] text-[#AD1F1F]";
        case "Completed":
          return "bg-[#D5FFD5] text-[#1FAD53]";
        default:
          return "bg-gray-500 text-white";
      }
    }

const getPaymentStatus = (paymentStatus: string | "Paid" | "Unpaid") => {
      switch (paymentStatus) {
        case "Paid":
          return "bg-[#D0FBE9] text-[#1A7544]";
        case "Unpaid":
          return "bg-[#FFD5D5] text-[#AD1F1F]";
        default:
          return "bg-gray-500 text-white";
      }
    }

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
        
        <div>
          {/*Header*/}
            <div className='space-y-2 font-bold text-2xl'>
                Booking Details <Badge className={getStatusBadge(bookingDetails?.status || "") + " ml-1 rounded-md"}><span className='text-xs'>{bookingDetails?.status || ""}</span></Badge>
                <br/>
                <p className='text-xs text-gray-500 font-normal'>View all information related to your booking.</p>
            </div>
          {/*Body Content*/}
            <div className='space-y-7'>
                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="text-muted-foreground">Booking ID</div>
                    <div className="font-medium text-foreground min-w-0 truncate">{bookingDetails?.id || "-"}</div>
                    
                    <div className="text-muted-foreground">Court Name</div>
                    <div className="font-medium text-foreground min-w-0 truncate">{bookingDetails?.courtName || "-"}</div>

                    <div className="text-muted-foreground">Venue</div>
                    <div className="font-medium text-foreground min-w-0 truncate">{bookingDetails?.venue || "-"}</div>

                    <div className="text-muted-foreground">Booking Date</div>
                    <div className="font-medium text-foreground min-w-0 truncate">{bookingDetails?.bookingDate || "-"}</div>

                    <div className="text-muted-foreground">Booking Time</div>
                    <div className="font-medium text-foreground min-w-0 truncate">{bookingDetails?.bookingTime || "-"}</div>

                    <div className="text-muted-foreground">Duration</div>
                    <div className="font-medium text-foreground min-w-0 truncate">{bookingDetails?.duration || "-"}</div>

                    <div className="text-muted-foreground">Total Payment</div>
                    <div className="font-medium text-foreground min-w-0 truncate">Rp{bookingDetails?.totalPayment || "-"}</div>

                    <div className="text-muted-foreground">Payment Status</div>
                    <div className="font-medium text-foreground min-w-0 truncate"><Badge className={getPaymentStatus(bookingDetails?.paymentStatus || "") + " rounded-md"}><span className='text-xs'>{bookingDetails?.paymentStatus || ""}</span></Badge></div>

                    <div className="text-muted-foreground">Payment Method</div>
                    <div className="font-medium text-foreground min-w-0 truncate">{bookingDetails?.paymentMethod || "-"}</div>
                </div>

                <div>
                    {bookingDetails?.status === "Upcoming" && ( 
                    <Badge className='rounded-md bg-[#ECF1BB] text-[#6B7413] p-4 text-sm font-normal'>
                        <Info className='w-6 h-6 mr-2 mb-5'/> Please arrive at least 10-15 minutes before your booking time to ensure a smooth check-in and warm-up.
                    </Badge>
                    )}

                    {bookingDetails?.status === "Completed" && ( 
                    <Badge className='rounded-md bg-[#ECF1BB] text-[#6B7413] p-4 text-sm font-normal'>
                        <Info className='w-6 h-6 mr-2 mb-5'/> Thanks for playing with us! If you enjoyed this session, feel free to book again at the same venue.
                    </Badge>
                    )}
                </div>
                {bookingDetails?.status === "Upcoming" && (
                  <div>
                    <Button onClick={() => onOpenChange(false)} className="w-full p-4 rounded-sm">Close</Button>
                  </div>
                )}
                {bookingDetails?.status === "Completed" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center justify-center">
                    <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full p-4 rounded-sm">Close</Button>
                    <Button onClick={() => onChangeMode("book-again")} className="w-full p-4 rounded-sm">Book Again</Button>
                  </div>
                )}
            </div>
      </div>
    )
}
