"use client"

import React from 'react'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import { LandPlot, Dot } from 'lucide-react'
import {useState,useEffect,useMemo} from 'react'
import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardDescription,
    CardFooter,
    CardTitle,
} from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import ComboboxFilter from '@/components/ui/combobox'
import { SeeOrderDetails } from './order-details'

type OrderData={
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

const PAGE_SIZE=10


export default function OrderHistory() {
    const [page,setPage]=useState(1)
    const [selectedOrder,setSelectedOrder]=useState<OrderData | null>(null)
    const [openDetails, setOpenDetails]=useState(false)

    const DummyData = [
        {
            orderId: "1xcSa23rP",
            bookingId: "Boo3178cquFG",
            venue: "Kemang",
            courtName: "Court 1",
            image: "/paddle-court1.svg",
            bookingTime: "10:00 AM",
            bookingDate: "2023-08-15",
            duration: "2 hours",
            totalPayment: 100000,
            paymentMethod: "Credit Card",
            paymentStatus: "Paid",
            created: "2023-08-15 10:00:00",
        },
        {
            orderId: "2xcSa23rP",
            bookingId: "Boo3178cquFG",
            venue: "Slipi",
            courtName: "Court 2",
            image: "/paddle-court2.svg",
            bookingTime: "12:00 PM",
            bookingDate: "2023-08-16",
            duration: "1 hour",
            totalPayment: 50000,
            paymentMethod: "QRIS",
            paymentStatus: "Pending",
            created: "2023-08-16 12:00:00",
        },
        {
            orderId: "3xcSa23rP",
            bookingId: "Boo3178cquFG",
            venue: "Lebak Bulus",
            courtName: "Court 3",
            image: "/paddle-court3.svg",
            bookingTime: "02:00 PM",
            bookingDate: "2023-08-17",
            duration: "3 hours",
            totalPayment: 150000,
            paymentMethod: "Bank Transfer",
            paymentStatus: "Failed",
            created: "2023-08-17 02:00:00",
        },
        {
            orderId: "4xcSa23rP",
            bookingId: "Boo3178cquFG",
            venue: "Slipi",
            courtName: "Court 4",
            image: "/paddle-court2.svg",
            bookingTime: "04:00 PM",
            bookingDate: "2023-08-18",
            duration: "2 hours",
            totalPayment: 100000,
            paymentMethod: "Credit Card",
            paymentStatus: "Paid",
            created: "2023-08-18 04:00:00",
        }
    ]

    const getPaymentStatus = (paymentStatus: string | "Paid" | "Pending" | "Failed") => {
        switch (paymentStatus) {
          case "Paid":
            return "bg-[#D0FBE9] text-[#1A7544]";
          case "Pending":
            return "bg-[#FFF5D5] text-[#AD751F]";
          case "Failed":
            return "bg-[#FFD5D5] text-[#AD1F1F]";
          default:
            return "bg-gray-500 text-white";
        }
      }

    const paginated=useMemo(()=>{
        const startIndex=(page-1)*PAGE_SIZE;
        return DummyData.slice(startIndex,startIndex+PAGE_SIZE)
    },[page, DummyData])



  return (
    <div className='flex flex-col gap-4'>
        <div className='flex justify-between items-center'>
            <h3 className='text-foreground text-2xl'>My Order</h3>
            <div className='flex gap-2'>
                <DatePicker/>
                <ComboboxFilter/>
                <Button className='bg-primary'>
                    <LandPlot className='w-4 h-4'/>
                    Book Court
                </Button>
            </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
            {paginated.map((orderData) => (
            <Card key={orderData.orderId} className='gap-1 p-1 border-foreground'>
                <CardHeader className='px-2 py-0'>
                    <img className="w-full h-full aspect-square" src={orderData.image || "/paddle-court1.svg"} />
                    <CardTitle className='flex justify-between'>ID#{orderData.bookingId} <Badge className={(getPaymentStatus(orderData.paymentStatus))}>{orderData.paymentStatus}</Badge></CardTitle>
                </CardHeader>
                <CardContent className='px-2 text-md gap-1'>
                    <div className='text-foreground text-sm'>{orderData.bookingDate}</div>
                    <div className='pt-1 pb-4 font-semibold'>
                        <div className='flex'>
                            {orderData.courtName}
                                <Dot width={16} height={24} strokeWidth={4}/>
                            {orderData.venue}
                        </div>
                        <div>
                            Rp {orderData.totalPayment}
                        </div>
                        <div>
                            {orderData.paymentMethod}
                        </div>
                    </div>   
                </CardContent>
                <CardFooter className='min-w-0 px-1 mb-1'>
                    {/*Payment Paid Button*/}
                    {orderData.paymentStatus === "Paid" && (
                    <Button 
                        className="w-full bg-primary"
                        onClick={()=>{setSelectedOrder(orderData); setOpenDetails(true)}}
                        >See Details
                    </Button>
                    )}

                    {/*Payment Pending Button*/}
                    {orderData.paymentStatus === "Pending" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-2">
                    <Button 
                        className ="w-full border-primary"
                        variant="outline"
                        onClick={()=>setSelectedOrder(orderData)}
                    >
                        See Details
                    </Button>
                    <Button 
                        className ="w-full"
                        variant="default"
                        onClick={()=>setSelectedOrder(orderData)}
                    >
                        Pay Now
                    </Button>
                    </div>
                    )}

                    {/*Payment Failed Button*/}
                    {orderData.paymentStatus === "Failed" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-2">
                    <Button 
                        className="w-full border-primary"
                        variant="outline"
                        onClick={()=>setSelectedOrder(orderData)}
                    >
                        See Details
                    </Button>
                    <Button 
                        className="w-full"
                        variant="default"
                        onClick={()=>setSelectedOrder(orderData)}
                    >
                        Re-Book
                    </Button>
                    </div>
                    )}
                </CardFooter>
            </Card>
            ))}
        </div>
        <SeeOrderDetails
            open={openDetails}
            onOpenChange={setOpenDetails}
            orderDetails={selectedOrder}/>
    </div>
  )
}
