"use client"

import React from "react"
import {Button} from '@/components/ui/button'
import { Badge, X } from "lucide-react"
import { useState,useEffect } from "react"
import { OrderSuccess } from "./order_success"
import { PaymentStatus } from "@prisma/client"

type PayNowProps ={
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

export function PayNow ({
    open,
    onOpenChange,
    payNowProps,
    onChangeMode,

}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payNowProps: PayNowProps | null
    onChangeMode: (mode: "details-payment" | "paynow" | "payment-success" | "payment-pending" | "view-booking") => void;
})  {


    return (

        <div>
            <div className='grid grid-cols-1'>
                <div className='space-y-2 text-2xl'>
                    Complete Your Payment
                    <p className='font-normal text-sm text-muted-foreground pt-2'>Scan this QR code using your mobile banking or e-wallet app to complete your payment.</p>
                </div>
            </div>
                <div className='text-xl gap-4 mt-4 space-y-6 items-center'>
                    <img src="/scan_me_qr_code.jpg" alt="barcode" className='w-[full] h-[full] rounded-md' />
                
                    <div className='flex flex-col items-center gap-2 text-sm text-foreground'>
                        <div>Total Payment Rp {payNowProps?.totalPayment}</div>
                        <div>Expires in 15 minutes</div>
                    </div>     
                </div>
            <div className='mt-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 w-full gap-2'>
                    <Button 
                        className ="w-full border-primary rounded-sm"
                        variant="outline"
                        onClick={()=>onOpenChange(false)}>
                        Close
                    </Button>

                    {/*Payment Paid*/}
                    {payNowProps?.paymentStatus === "Paid" && (
                    <Button 
                        className ="w-full rounded-sm"
                        variant="default"
                        onClick={()=>{onChangeMode("payment-success")}}>
                        Payment Status
                    </Button>
                    )}

                    {/*Payment Pending*/}
                    {payNowProps?.paymentStatus === "Pending" && (
                    <Button 
                        className ="w-full rounded-sm"
                        variant="default"
                        onClick={()=>{onChangeMode("payment-pending")}}>
                        Payment Status
                    </Button>
                    )}
                    
                </div>
            </div>
        </div>
    )
}