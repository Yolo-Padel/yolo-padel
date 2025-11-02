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
        <Dialog open={open} onOpenChange={onOpenChange}>         
            <DialogContent showCloseButton={false} className='flex flex-col gap-4 p-8'>
                <DialogHeader className="gap-6">
                    <div className='flex justify-between'>
                <DialogTitle className='text-xl font-semibold'>Payment Status</DialogTitle>
                <X className='cursor-pointer rounded-full bg-primary p-1' onClick={()=>onOpenChange(false)} />
                    </div>
                <img src="/payment-waiting.svg" className='w-[150px] h-[150px] mx-auto'/>
                </DialogHeader>
                <DialogDescription className='text-center flex flex-col items-center gap-6'>
                    <div className='flex flex-col items-center'>
                        <span className='text-lg text-foreground font-semibold'>Waiting for payment</span>
                        <span className='text-muted-foreground font-normal'>We're waiting for your payment to be completed. Once confirmed, your booking will be secured automatically.</span>
                    </div>

                    <div className='grid grid-cols-2 w-full border border-primary rounded-md p-4 gap-2'>
                        <span className='text-foreground font-normal'>
                            {paymentProps?.courtName} 
                            <Dot width={12} height={18} strokeWidth={4}/> 
                            {paymentProps?.venue}
                        </span>
                        <span className='text-foreground font-semibold'> {paymentProps?.bookingDate}</span>

                        <span className='text-foreground font-normal'>{paymentProps?.bookingTime}</span>
                        <span className='text-foreground font-semibold'> {paymentProps?.duration}</span>

                        <span className='text-foreground font-normal'>Payment Method</span>
                        <span className='text-foreground font-semibold'> {paymentProps?.paymentMethod}</span>

                        <span className='text-foreground font-normal'>Total Payment</span>
                        <span className='text-foreground font-semibold'>Rp {paymentProps?.totalPayment}</span>
                    </div>

                    <span className='text-muted-foreground font-normal mx-12'>Make sure to transfer the exact amount shown above. Your booking will be confirmed automatically once payment is received.</span>
                </DialogDescription>
                <DialogFooter>              
                <Button 
                    onClick={()=>onOpenChange(false)} 
                    variant="default" 
                    className='w-full bg-primary text-primary-foreground'>
                        Cancel Payment
                </Button> 
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
