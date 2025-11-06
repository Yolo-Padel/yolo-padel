"use client"

import React from "react"
import {Button} from "@/components/ui/button"
import {useState, useEffect} from "react"
import { ArrowBigLeft, ArrowLeftIcon } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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


export function ChangePaymentMethod ({
    open,
    onOpenChange,
    paymentMethodProps,
    onChangeMode,
    
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentMethodProps: PaymentMethodProps | null;
    onChangeMode: (mode: "details-payment" | "paynow" | "payment-success" | "view-booking" | "change-method" | "confirm-method") => void;
}) {
    

    return (
        <div className="p-1 space-y-6.5">
            <div className="flex items-center gap-2">
                <Button 
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md"
                    variant="default"
                    onClick={()=>{onChangeMode("details-payment")}}
                > <ArrowLeftIcon className="w-4 h-4" />
                </Button>

                <span className="font-semibold text-xl"> Select Payment Method </span>
            </div>

            <p className="text-sm text-muted-foreground">
                You're about to change your payment method for this order. 
                Your previous payment link or QR code will be invalidated once you confirm.
            </p>

            {/*content list payment method option*/}
            <div className="text-foreground">
                <h3 className="mb-3 text-md font-semibold"> Payment Method </h3>

                <RadioGroup defaultValue={paymentMethodProps?.paymentMethod}>
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                        <label htmlFor="QRIS" className="flex items-center"><img src="/qris.png" className="w-4 h-4 mr-2" />QRIS</label>
                        <RadioGroupItem className="h-4 w-4 border-2 [&_svg]:w-3 [&_svg]:h-3" value="QRIS" id="QRIS"/>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                        <label htmlFor="BNI" className="flex items-center"><img src="/bni.png" className="w-4 h-4 mr-2" />BNI Virtual Account</label>
                        <RadioGroupItem className="h-4 w-4 border-2 [&_svg]:w-3 [&_svg]:h-3" value="BNI" id="BNI"/>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                        <label htmlFor="BCA" className="flex items-center"><img src="/bca.png" className="w-4 h-4 mr-2" />BCA Virtual Account</label>
                        <RadioGroupItem className="h-4 w-4 border-2 [&_svg]:w-3 [&_svg]:h-3" value="BCA" id="BCA"/>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                        <label htmlFor="BRI" className="flex items-center"><img src="/bri.png" className="w-4 h-4 mr-2" />BRI Virtual Account</label>
                        <RadioGroupItem className="h-4 w-4 border-2 [&_svg]:w-3 [&_svg]:h-3" value="BRI" id="BRI"/>
                    </div>
                </RadioGroup>

                <div className="grid grid-cols-2 w-full gap-4 mt-8">
                    <Button className="w-full border-primary" variant="outline" onClick={()=>{onOpenChange(false)}}>
                        Cancel
                    </Button>

                    <Button className="w-full" variant="default" onClick={()=>{paymentMethodProps?.paymentMethod;onChangeMode("confirm-method")}}>
                        Confirm Change
                    </Button>
                </div>
            </div>
        </div>
    )
}
