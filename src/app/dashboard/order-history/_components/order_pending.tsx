"use client"

import React from 'react'
import {Button} from '@/components/ui/button'
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter} from '@/components/ui/dialog'
import {CheckCircleIcon} from 'lucide-react'
import {useState} from 'react'
import {Dot, X} from 'lucide-react'

type PaymentProps={
    orderId: string;
    bookingId: string;
    venue: string;
    courtName: string;
    image?: string;
    bookingTime?: string;
    bookingDate: string;
    duration: string;
    totalPayment: number;
    paymentMethod: string | "Credit Card" | "QRIS" | "Bank Transfer";
    paymentStatus: string | "Paid" | "Pending" | "Failed";
    created: string; 
}

export function OrderPending({


    open,
    onOpenChange,
    paymentProps,
}: {
    open: boolean;
    onOpenChange: (open:boolean)=>void;
    paymentProps: PaymentProps | null;
}) {
    return (
                 
        <div className='flex flex-col gap-8'>
    
                {/* Header*/}
                <span className='text-2xl font-semibold'>Payment Status</span>
                
                {/* Content*/}
            <div className='text-center flex flex-col items-center gap-4'>
                {/* Content Image*/}
                <div className='flex flex-col items-center gap-4'>
                    <img src="/payment-waiting.svg" className='w-[100px] h-[100px] mx-auto'/>
                    <div className='flex flex-col items-center gap-2'>
                        <span className='text-lg text-foreground font-semibold'>Waiting for payment</span>
                        <span className='text-sm text-muted-foreground font-normal mx-6'>We're waiting for your payment to be completed. Once confirmed, your booking will be secured automatically.</span>
                    </div>
                {/* Content Info*/}
                    <div className='grid grid-cols-2 w-full border border-primary rounded-md p-4 px-auto gap-2 place-items-center'>
                    <div className='flex flex-col items-start gap-1'>
                        <div className='flex min-w-0 truncate items-center text-foreground font-normal'>
                            {paymentProps?.courtName} 
                            <Dot width={12} height={18} strokeWidth={4}/> 
                            {paymentProps?.venue}
                        </div>
                        <span className='text-foreground font-normal'>{paymentProps?.bookingTime}</span>
                        <span className='text-foreground font-normal'>Payment Method</span>
                        <span className='text-foreground font-normal'>Total Payment</span>
                    </div>

                    <div className='flex flex-col items-end gap-1 font-normal'>
                        <span> {paymentProps?.bookingDate}</span>
                        <span> {paymentProps?.duration}</span>
                        <span> {paymentProps?.paymentMethod}</span>
                        <span>Rp {paymentProps?.totalPayment}</span>
                    </div>
                    </div>

                    <span className='text-sm text-muted-foreground font-normal mx-6'>Make sure to transfer the exact amount shown above. Your booking will be confirmed automatically once payment is received.</span>
                </div>
                {/* Button Action*/}
                <div className='w-full'>              
                    <Button 
                        onClick={()=>onOpenChange(false)} 
                        variant="default" 
                        className='w-full bg-primary text-primary-foreground'>
                            Cancel Payment
                    </Button> 
                </div>
            </div>
        </div>
    )
}
