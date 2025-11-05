"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeftIcon, ArrowRightIcon, ChevronDown, ChevronUp, Dot } from "lucide-react"
{/*Import Modal*/}

type BookingSummaryProps = {
  id: string;
  venue: string;
  courtName: string;
  image?: string;
  bookingTime?: string;
  bookingDate: string;
  duration: string;
  totalPayment: number;
  status: string | "Upcoming" | "Cancelled" | "Completed";
  paymentMethod: string | "QRIS" | "Bank Transfer" | "BNI Virtual Account" | "BCA Virtual Account" | "BRI Virtual Account" | "Mandiri Virtual Account";
  paymentStatus: string | "Paid" | "Unpaid";
};

export function BookingSummary ({
    open,
    onOpenChange,
    bookingSummaryProps,
    onChangeMode,
}:{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookingSummaryProps: BookingSummaryProps | null;
    onChangeMode: (mode: "booking-details" | "book-again" | "payment-paid" | "payment-pending" | "booking-payment") => void;
}) {
    // Toggle state untuk view all payment method
    const [viewAll, setViewAll] = React.useState(false);

    const paymentMethods = ["QRIS", "Bank Transfer", "BNI Virtual Account", "BCA Virtual Account", "BRI Virtual Account", "Mandiri Virtual Account"]

    const displayMethods = viewAll ? paymentMethods : paymentMethods.slice(0, 3)
    

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button className="bg-primary" onClick={() => onOpenChange(false)}>
                    <ArrowLeftIcon className="h-4 w-4 mx-2" />
                </Button>

                <h2 className="text-2xl font-semibold">Order Summary</h2>
            </div>
            {/*booking information */}
            <div className='grid grid-cols-2 w-full border border-primary rounded-md p-8 px-auto gap-2 place-items-center'>
                <div className='flex flex-col items-start gap-1 text-foreground font-normal'>
                    <div className='flex min-w-0 truncate items-center'>
                        {bookingSummaryProps?.courtName} 
                        <Dot width={12} height={18} strokeWidth={4}/> 
                        {bookingSummaryProps?.venue}    
                    </div>
                
                    <span>{bookingSummaryProps?.bookingTime}</span>
                    <span>Total Payment</span>
                </div>
                <div className='flex flex-col items-end gap-1 font-normal text-foreground'>
                    <span> {bookingSummaryProps?.bookingDate}</span>
                    <span> {bookingSummaryProps?.duration}</span> 
                    <span>Rp {bookingSummaryProps?.totalPayment}</span>
                </div>
            </div>

            {/*Payment Method*/}
            <div className="text-foreground">
                <h3 className="mb-3 text-lg font-semibold"> Payment Method </h3>
                
                <RadioGroup defaultValue={bookingSummaryProps?.paymentMethod}>
                    {displayMethods.map((pm) => (
                    <div key={pm} className="flex items-center justify-between px-4 py-2 border-b border-border">
                        <label htmlFor={pm} className="flex items-center"><img src="/qris.png" className="w-4 h-4 mr-2" />{pm}</label>
                        <RadioGroupItem value={pm} id={pm} className="h-4 w-4 border-2 [&_svg]:w-3 [&_svg]:h-3"/>
                    </div>
                    ))}
                </RadioGroup>
                {/*Show/hide All Payment Method Button*/}
                <div className="flex justify-center items-center mt-3">
                    {paymentMethods.length > 3 && (
                        <span className="inline-flex items-center text-primary px-4 py-2" onClick={() => setViewAll(!viewAll)}>
                            {viewAll ? "View less" : "View All Payment Methods"} 
                            {viewAll ? <ChevronUp className="h-6 w-6 ml-2" /> : <ChevronDown className="h-6 w-6 ml-2" />}
                        </span>
                        
                    )}
                </div>

                {/*Transaction Summary*/}
                <h3 className="mb-3 text-lg font-semibold"> Transaction Summary </h3>
                <div className='grid grid-cols-2 w-full gap-2'>
                    <div className='flex flex-col items-start gap-1 text-foreground font-normal'>
                        <span>Court Fee</span>
                        <span>Tax (10%)</span>
                        <span>Booking Fee</span>

                        {/*}Total Payment*/}
                        <h3 className="text-lg font-semibold mt-2">Total Transaction</h3>
                    </div>
                    <div className='flex flex-col items-end gap-1 font-normal text-foreground'>
                        <span> Rp 600.000</span>
                        <span> Rp 60.000</span> 
                        <span>Rp 5.000</span>

                        {/*}Amount Total Payment*/}
                        <h3 className="text-lg font-semibold mt-2">Rp. 665.000</h3>
                    </div>
                </div>

                <Button 
                    className="bg-primary text-md w-full py-2 rounded-md mt-4"
                    onClick={() => onChangeMode("booking-payment")}>
                    Book Now <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    )
}
