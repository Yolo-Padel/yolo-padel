"use client"

import React from "react"
import {Dialog, DialogContent} from "@/components/ui/dialog"
import {XIcon} from "lucide-react"
{/*Import Modal*/}
import { SeeBookingDetails } from "./booking-details"
import { BookingSummary } from "./booking-summary"
import { Payment } from "./booking-payment"
import { SuccessPayment } from "./booking-paid"

type BookingModalProps = {
    
  id: string;
  venue: string;
  courtName: string;
  image?: string;
  bookingTime?: string;
  bookingDate: string;
  duration: string;
  totalPayment: number;
  status: string | "Upcoming" | "Expired" | "Completed";
  paymentMethod: string | "Credit Card" | "QRIS" | "Bank Transfer";
  paymentStatus: string | "Paid" | "Unpaid";
};

const getStatusBadge = (status: string | "Upcoming" | "Expired" | "Completed") => {
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


export function BookingModal ({
    open,
    onOpenChange,
    bookingModalProps,
    mode,
    onChangeMode,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    bookingModalProps: BookingModalProps | null;
    mode: "booking-details" | "order-summary" | "book-again" | "payment-paid" | "payment-pending" | "booking-payment";
    onChangeMode: (mode: "booking-details" | "order-summary" | "book-again" | "payment-paid" | "payment-pending" | "booking-payment") => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange} key={bookingModalProps?.id}>
            <DialogContent showCloseButton={false} className="p-8">
                <XIcon className='absolute top-8 right-6 cursor-pointer bg-primary rounded-full p-1' onClick={() => onOpenChange(false)} />
                
                {/*Booking Details Modal*/}
                {mode === "booking-details" && (
                        <SeeBookingDetails
                            open={open}
                            onOpenChange={onOpenChange}
                            bookingDetails={bookingModalProps}
                            onChangeMode={onChangeMode}
                        />
                )}

                {/*Order Summary Modal*/}
                {mode === "book-again" && (
                    <BookingSummary
                            open={open}
                            onOpenChange={onOpenChange}
                            bookingSummaryProps={bookingModalProps}
                            onChangeMode={onChangeMode}
                        />
                )}

                {/*Booking Payment Modal*/}
                {mode === "booking-payment" && (
                    <Payment
                            open={open}
                            onOpenChange={onOpenChange}
                            paymentProps={bookingModalProps}
                            onChangeMode={onChangeMode}
                        />
                )}

                {/*Payment Paid Modal*/}
                {mode === "payment-paid" && (
                    <SuccessPayment
                            open={open}
                            onOpenChange={onOpenChange}
                            successPaymentProps={bookingModalProps}
                            onChangeMode={onChangeMode}
                        />
                )}
            </DialogContent>
        </Dialog>
    )
}