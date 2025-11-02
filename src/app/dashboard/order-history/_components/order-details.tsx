"use client"

import React from 'react'
import {Dialog,DialogContent,DialogHeader,DialogTitle, DialogDescription, DialogFooter} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import { X } from 'lucide-react'
import {useState, useMemo, useEffect } from 'react'
import {Payment} from './order-paynow-modal'

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
    onPayNowClick,
    
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderDetails: OrderDetails | null;
    onPayNowClick?: () => void;
    
}) {

    const [openPayNow, setOpenPayNow] = useState(false);

    return (
         <Dialog open={open} onOpenChange={onOpenChange} key={orderDetails?.orderId}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <div className='grid grid-cols-1'>
                    <DialogTitle className='space-y-2 text-2xl'>
                        Payment Details
                        <p className='font-normal text-sm text-muted-foreground pt-2'>Your payment has been {orderDetails?.paymentStatus?.toUpperCase()}. Here's your booking and transaction summary.</p>
                    </DialogTitle>
                    <X className='absolute top-9 right-9 cursor-pointer rounded-full bg-primary p-1' onClick={()=>onOpenChange(false)} />
                    </div>
                    <DialogDescription className='text-xl gap-4 mt-4 space-y-6'>
                    
                        <span className='font-semibold text-foreground'>Order Summary</span>
                        <div className='grid grid-cols-2 gap-2 mt-4 text-sm text-foreground'>
                            <div>Order ID</div>
                            <div className='font-medium'>{orderDetails?.orderId}</div>
                            
                            <div>Booking ID</div>
                            <div className='font-medium'>{orderDetails?.bookingId}</div>
                            
                            <div>Venue</div>
                            <div className='font-medium'>{orderDetails?.venue}</div>

                            <div>Court Name</div>
                            <div className='font-medium'>{orderDetails?.courtName}</div>

                            <div>Date</div>
                            <div className='font-medium'>{orderDetails?.bookingDate}</div>
                            
                            <div>Time</div>
                            <div className='font-medium'>{orderDetails?.bookingTime}</div>
                            
                            <div>Duration</div>
                            <div className='font-medium'>{orderDetails?.duration}</div>
                        </div>
                        <span className='font-semibold text-foreground'>Payment Status</span>
                        <div className='grid grid-cols-2 gap-2 mt-4 text-sm text-foreground'>
                            <div>Total Amount</div>
                            <div className='font-medium'>Rp {orderDetails?.totalPayment}</div>
                            
                            <div>Payment Method</div>
                            <div className='font-medium'>{orderDetails?.paymentMethod}</div>
                            
                            <div>Payment Status</div>
                            <div className={`font-medium`}><Badge className={getPaymentStatus(orderDetails?.paymentStatus || " ")}>{orderDetails?.paymentStatus}</Badge></div>
                            
                            <div>Created</div>
                            <div className='font-medium'>{orderDetails?.created}</div>
                        </div>
                    </DialogDescription>
                    <DialogFooter className="mt-4">
                      
                        {/*Payment Paid Button*/}
                        {orderDetails?.paymentStatus === "Paid" && (
                        <div className='grid grid-cols-1 sm:grid-cols-2 w-full gap-2'>
                        <Button 
                            className ="w-full border-primary rounded-sm"
                            variant="outline"
                            onClick={()=> onOpenChange(false)}
                        >
                            Close
                        </Button>

                        <Button 
                            className ="w-full rounded-sm"
                            variant="default"
                            onClick={()=>window.open(`/api/order/${orderDetails?.orderId}/receipt`)}
                        >
                            Download Receipt
                        </Button>
                        </div>
                        )}

                        {/*Pending Payment Button*/}
                        {orderDetails?.paymentStatus === "Pending" && (
                        <div className='grid grid-cols-1 sm:grid-cols-2 w-full gap-2'>
                        <Button 
                            className ="w-full border-primary rounded-sm"
                            variant="outline"
                            onClick={()=> onOpenChange(false)}
                        >
                            Change Payment Method
                        </Button>

                        <Button 
                            className ="w-full rounded-sm"
                            variant="default"
                            onClick={()=> 
                            onOpenChange(false)
                            }
                        >
                            Pay Now
                        </Button>
                        </div>
                        )}

                        {/*Payment Failed Button*/}
                        {orderDetails?.paymentStatus === "Failed" && (
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
                            onClick={()=>("")}
                        >
                            Re-Book
                        </Button>
                        </div>
                        )}        
                                       
                    </DialogFooter>
                </DialogHeader>
                <div>
                <Payment 
                open={openPayNow}
                onOpenChange={setOpenPayNow}
                paymentProps={orderDetails}/>
                </div>
            </DialogContent>
          </Dialog>  
          
    )
}

