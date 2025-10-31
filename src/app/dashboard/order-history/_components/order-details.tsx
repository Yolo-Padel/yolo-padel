"use client"

import React from 'react'
import {Dialog,DialogContent,DialogHeader,DialogTitle, DialogDescription, DialogFooter} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import { X } from 'lucide-react'

type OrderDetails ={
    orderId: string;
    bookingId: string;
    venue: string;
    courtName: string;
    image?: string;
    bookingTime?: string;
    bookingDate: string;
    duration: string;
    //Payment Detail
    totalPayment: number;
    paymentMethod: string | "Credit Card" | "QRIS" | "Bank Transfer";
    paymentStatus: string | "Paid" | "Pending" | "Failed";
    created: string; 
}

const getPaymentStatus = (paymentStatus: string | "Paid" | "Pending" | "Failed") => {
    switch (paymentStatus) {
      case "Paid":
        return "bg-[#D5FFD5] text-[#1FAD53]";
      case "Pending":
        return "bg-[#FFF5D5] text-[#AD751F]";
      case "Failed":
        return "bg-[#FFD5D5] text-[#AD1F1F]";
      default:
        return "bg-gray-500 text-white";
    }
  }

export function SeeOrderDetails ({
    open,
    onOpenChange,
    orderDetails,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderDetails: OrderDetails | null;
}) {
    return (
         <Dialog open={open} onOpenChange={onOpenChange} key={orderDetails?.orderId}>
            <DialogContent showCloseButton={false} className='space-y-4'>
                <DialogHeader>
                    <DialogTitle className='space-y-2 text-2xl'>
                        Payment Detail
                        <p className='font-normal text-sm text-muted-foreground pt-2'>Your payment has been successfully completed. Here's your booking and transaction summary.</p>
                    </DialogTitle>
                    <DialogDescription className='text-xl gap-4'>
                        Order Summary
                        
                        <div className='flex justify-between text-sm '>
                            <span>Booking ID:</span>
                            <span>{orderDetails?.bookingId}</span>
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
         </Dialog>
    )
}

