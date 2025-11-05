"use client"

import React from 'react'
import {Button} from '@/components/ui/button'
import {Dot, X} from 'lucide-react'

type SuccessPaymentProps={
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
}

export function SuccessPayment ({

    open,
    onOpenChange,
    successPaymentProps,
    onChangeMode,
}: {
    open: boolean;
    onOpenChange: (open:boolean)=>void;
    successPaymentProps: SuccessPaymentProps | null;
    onChangeMode: (mode: "booking-details" | "order-summary" | "book-again" | "payment-paid" | "payment-pending" | "booking-payment") => void;
}) {
    return (
                 
            <div className='flex flex-col gap-8'>
                {/* Header*/}
                <span className='text-2xl font-semibold'>Payment Status</span>
                {/* Content*/}
            <div className='text-center flex flex-col items-center gap-4'>
                {/* Content Image*/}
                <div className='flex flex-col items-center gap-4'>
                    <img src="/payment-success.svg" className='w-[100px] h-[100px] mx-auto'/>
                    <div className='flex flex-col items-center gap-2'>
                        <span className='text-lg text-foreground font-semibold'>Booking Confirmed</span>
                        <span className='text-sm text-muted-foreground font-normal mx-6'>Your padel court is ready — see you on the court!</span>
                    </div>
                {/* Content Info*/}
                    <div className='grid grid-cols-2 w-full border border-primary rounded-md p-4 px-auto gap-2 place-items-center'>
                    <div className='flex flex-col items-start gap-1'>
                        <div className='flex min-w-0 truncate items-center text-foreground font-normal'>
                            {successPaymentProps?.courtName} 
                            <Dot width={12} height={18} strokeWidth={4}/> 
                            {successPaymentProps?.venue}
                        </div>
                        <span className='text-foreground font-normal'>{successPaymentProps?.bookingTime}</span>
                        <span className='text-foreground font-normal'>Payment Method</span>
                        <span className='text-foreground font-normal'>Total Payment</span>
                    </div>

                    <div className='flex flex-col items-end gap-1 font-normal'>
                        <span> {successPaymentProps?.bookingDate}</span>
                        <span> {successPaymentProps?.duration}</span>
                        <span> {successPaymentProps?.paymentMethod}</span>
                        <span>Rp {successPaymentProps?.totalPayment}</span> 
                    </div>
                        </div>
                    <span className='text-muted-foreground font-normal mx-12'>An e-receipt has been sent to your email. Please check in at the front desk upon arrival.</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-2">
                <Button 
                    className ="w-full border-primary rounded-sm"
                    variant="outline"
                    onClick={()=> onOpenChange(false)}>
                        Book Again
                </Button>
                <Button 
                    onClick={()=>onChangeMode("booking-details")} 
                    variant="default" 
                    className='w-full bg-primary text-primary-foreground'>
                        My Booking
                </Button>
                </div>
            </div>
        </div>
    )
}