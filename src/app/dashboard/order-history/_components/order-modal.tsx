"use client"

import React from "react"
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {Dialog,DialogContent,DialogHeader,DialogTitle, DialogDescription, DialogFooter} from '@/components/ui/dialog'
import { X } from 'lucide-react'
import {useState, useMemo, useEffect } from 'react'
import {SeeOrderDetails} from './order-details'
import { PayNow } from "./pay-now"
import { OrderSuccess } from "./order_success"
import { OrderPending } from "./order_pending"
import { ChangePaymentMethod } from "./select-payment-method"
import { ConfirmPaymentMethod } from "./confirm-payment-method"



type OrderProps={
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

export function OrderModal ({
    open,
    onOpenChange,
    orderProps,
    mode,
    onChangeMode, 
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderProps: OrderProps | null;
    mode: "details-payment" | "paynow" | "payment-success" | "payment-pending" | "view-booking" | "change-method" | "confirm-method";
    onChangeMode: (mode: "details-payment" | "paynow" | "payment-success" | "payment-pending" | "view-booking" | "change-method" | "confirm-method") => void;
}) {
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange} key={orderProps?.orderId}>
            <DialogContent showCloseButton={false}>
                <X className="absolute top-7 right-8 bg-primary rounded-full p-1" onClick={() => onOpenChange(false)} />
                
                {/*Pay Now Content Modal*/}
                {mode === "paynow" && (
                    <div>
                        <PayNow 
                        open={open} 
                        onOpenChange={onOpenChange} 
                        payNowProps={orderProps}
                        onChangeMode={onChangeMode}
                        />
                    </div>
                )}

                {/*See Details Content Modal*/}
                {mode === "details-payment" && (
                    <div>
                        <SeeOrderDetails 
                        open={open} 
                        onOpenChange={onOpenChange} 
                        orderDetails={orderProps}
                        onChangeMode={onChangeMode}
                        mode={mode}
                        />
                    </div>
                )}

                {/* On Payment Success*/}
                {mode === "payment-success" && (
                    <div>
                        <OrderSuccess
                        open={open}
                        onOpenChange={onOpenChange}
                        paymentProps={orderProps}
                        onChangeMode={onChangeMode}
                        />
                    </div>
                )}

                {/* On Payment Pending*/}
                {mode === "payment-pending" && (
                    <div>
                        <OrderPending
                        open={open}
                        onOpenChange={onOpenChange}
                        paymentProps={orderProps}
                        />
                    </div>
                )}

                {/* Change Method Payment*/}
                {mode === "change-method" && (
                    <div>
                        <ChangePaymentMethod
                        open={open}
                        onOpenChange={onOpenChange}
                        paymentMethodProps={orderProps}
                        onChangeMode={onChangeMode}
                        />
                    </div>
                )}

                {/* Confirm Method Payment*/}
                {mode === "confirm-method" && (
                    <div>
                        <ConfirmPaymentMethod
                        open={open}
                        onOpenChange={onOpenChange}
                        paymentMethodProps={orderProps}
                        onChangeMode={onChangeMode}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
