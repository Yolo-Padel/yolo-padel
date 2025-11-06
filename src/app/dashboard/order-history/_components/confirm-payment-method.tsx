"use client"

import React from "react"
import {Button} from "@/components/ui/button"
import {useState, useEffect} from "react"
import { ArrowLeftIcon, CopyIcon } from "lucide-react"

type PaymentMethodProps = {
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


export function ConfirmPaymentMethod ({
    open,
    onOpenChange,
    paymentMethodProps,
    onChangeMode,
    
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentMethodProps: PaymentMethodProps | null;
    onChangeMode: (mode: "change-method" | "confirm-method") => void;
}) {
    

    return (
        <div className="p-1 space-y-6.5">
            <div className="flex items-center gap-2">
                <Button 
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md"
                    variant="default"
                    onClick={()=>onChangeMode("change-method")}
                > <ArrowLeftIcon className="w-4 h-4" />
                </Button>

                <span className="font-semibold text-xl"> Complete Your Payment </span>
            </div>

            <p className="text-sm text-muted-foreground">
                Complete your payment with selected payment method you have chosen. follow the instruction below.
            </p>

            {/*content confirm payment method*/}
            <div className=" border border-border rounded-md p-4">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
                    <span className="mb-3 text-md font-semibold"> {paymentMethodProps?.paymentMethod} </span>
                    <img src={paymentMethodProps?.paymentMethod === "BNI" ? "/bni.png" : paymentMethodProps?.paymentMethod === "QRIS" ? "/qris.png" : "/bca.png"} className="w-12 h-12" />
                </div>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-1">
                        <span>Virtual Account Number</span>
                        <span className="font-normal text-muted-foreground"> {paymentMethodProps?.paymentMethod === "BNI" ? "1234567890" : paymentMethodProps?.paymentMethod === "QRIS" ? "0987654321" : "1234567890"} </span>
                    </div>
                    <Button variant="ghost" onClick={()=>{}}>
                        <CopyIcon className="w-4 h-4" /> Copy
                    </Button>
                </div>
                <div className="flex flex-col mt-2">
                    <span>Total Payment</span>
                    <div className="flex items-center gap-2">
                        <span className="font-normal">Rp{paymentMethodProps?.totalPayment} </span>
                        <Button variant="ghost" onClick={()=>{}}>
                            <CopyIcon className="w-4 h-4" /> Copy
                        </Button>
                    </div>
                </div>
            </div>
            <div className="w-full gap-4 mt-8">
                    <Button className="w-full border-primary" variant="default" onClick={()=>{onOpenChange(false)}}>
                        Back to Order
                    </Button>
            </div>
        </div>
    )
}
