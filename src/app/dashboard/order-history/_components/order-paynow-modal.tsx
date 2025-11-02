"use client"

import React from 'react'
import {Dialog,DialogContent,DialogHeader,DialogTitle, DialogDescription, DialogFooter} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import { X } from 'lucide-react'
import {Barcode} from 'lucide-react'
import {useState, useMemo, useEffect } from 'react'
import {OrderSuccess} from './order_success'
import {OrderPending} from './order_pending'



type PaymentProps ={
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


export function Payment ({
    open,
    onOpenChange,
    paymentProps,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentProps: PaymentProps | null;
}) {

    const [openModalSuccess,setOpenModalSuccess]=useState(false)
    const [openModalPending,setOpenModalPending]=useState(false)

    return (
         <Dialog open={open} onOpenChange={onOpenChange} key={paymentProps?.orderId}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <div className='grid grid-cols-1'>
                    <DialogTitle className='space-y-2 text-2xl'>
                        Complete Your Payment
                        <p className='font-normal text-sm text-muted-foreground pt-2'>Scan this QR code using your mobile banking or e-wallet app to complete your payment.</p>
                    </DialogTitle>
                    <X className='absolute top-9 right-9 cursor-pointer rounded-full bg-primary p-1' onClick={()=>onOpenChange(false)} />
                    </div>
                    <DialogDescription className='text-xl gap-4 mt-4 space-y-6 items-center'>
                            <img src="/scan_me_qr_code.jpg" alt="barcode" className='w-auto h-auto rounded-md' />
                        <div className='flex flex-col items-center gap-2 text-sm text-foreground'>
                            <div>Total Payment Rp {paymentProps?.totalPayment}</div>
                            <div>Expires in 15 minutes</div>
                        </div>
                        
                    </DialogDescription>
                    <DialogFooter className="mt-4">
                      
                        {/*Pending Payment Button*/}
                        {paymentProps?.paymentStatus === "Pending" && (
                        <div className='grid grid-cols-1 sm:grid-cols-2 w-full gap-2'>
                        <Button 
                            className ="w-full border-primary rounded-sm"
                            variant="outline"
                            onClick={()=>onOpenChange(false)}
                        >
                            Close
                        </Button>

                        <Button 
                            className ="w-full rounded-sm"
                            variant="default"
                            onClick={()=>setOpenModalPending(true)}
                        >
                            Payment Status
                        </Button>
                        </div>
                        )}
                        
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
            <div>
                <OrderSuccess
                open={openModalSuccess}
                onOpenChange={setOpenModalSuccess}
                paymentProps={paymentProps}
                />
            </div>

            <div>
                <OrderPending
                open={openModalPending}
                onOpenChange={setOpenModalPending}
                paymentProps={paymentProps}
                />
            </div>
         </Dialog>
    )
}

