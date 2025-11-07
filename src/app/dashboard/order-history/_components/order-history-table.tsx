"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandPlot, Dot } from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import ComboboxFilter from "@/components/ui/combobox";
import { OrderHistoryModal } from "./order-history-modal";
import { OrderHistorySkeleton } from "./order-history-skeleton";
import { useOrders, type Order } from "@/hooks/use-order";
import { PaymentStatus } from "@/types/prisma";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Image from "next/image";

const PAGE_SIZE = 10;

export default function OrderHistoryTable() {
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderModal, setOrderModal] = useState(false);
  const [modeModal, setModeModal] = useState<
    | "order-details"
    | "payment-instruction"
    | "payment-status"
    | "view-booking"
    | "change-payment-method"
  >("payment-instruction");

  // Fetch orders from API
  const {
    data: ordersResponse,
    isLoading,
    error,
  } = useOrders({
    page,
    limit: PAGE_SIZE,
  });

  // Map PaymentStatus enum to display styles
  const getPaymentStatus = (paymentStatus: PaymentStatus) => {
    switch (paymentStatus) {
      case "PAID":
        return "bg-[#D0FBE9] text-[#1A7544]";
      case "PENDING":
        return "bg-[#FFF5D5] text-[#AD751F]";
      case "FAILED":
      case "EXPIRED":
        return "bg-[#FFD5D5] text-[#AD1F1F]";
      case "REFUNDED":
        return "bg-[#E5E7EB] text-[#374151]";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Get display label for payment status
  const getPaymentStatusLabel = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return "Paid";
      case "PENDING":
        return "Pending";
      case "FAILED":
        return "Failed";
      case "EXPIRED":
        return "Expired";
      case "REFUNDED":
        return "Refunded";
      default:
        return status;
    }
  };

  // Orders data from API
  const orders = ordersResponse?.data || [];
  const totalPages = ordersResponse?.pagination.totalPages || 1;

  // Helper function to get venue name from order (all bookings should be same venue in most cases)
  const getVenueName = (order: Order) => {
    if (order.bookings.length === 0) return "Unknown Venue";
    // Get venue name from first booking
    return order.bookings[0].court.venue.name;
  };

  // Helper function to format booking count
  const getBookingCountText = (order: Order) => {
    const count = order.bookings.length;
    return count === 1 ? "1 Court Booked" : `${count} Courts Booked`;
  };

  // Helper function to get venue image or default
  const getOrderImage = (order: Order) => {
    if (order.bookings.length === 0) return "/paddle-court1.svg";
    const venueImages = order.bookings[0].court.venue.images;
    // Return first venue image if available, otherwise fallback to default
    return venueImages && venueImages.length > 0
      ? venueImages[0]
      : "/paddle-court1.svg";
  };

  // Helper function to format order date (created date)
  const formatOrderDate = (order: Order) => {
    const date = new Date(order.createdAt);
    return format(date, "d MMM yyyy", { locale: idLocale });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-foreground text-2xl">My Order</h3>
        <div className="flex gap-2">
          <DatePicker />
          <ComboboxFilter />
          <Button className="bg-primary">
            <LandPlot className="w-4 h-4" />
            Book Court
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <OrderHistorySkeleton count={4} />}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">Failed to load orders</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please try again later
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders found</p>
          <Button className="mt-4 bg-primary">
            <LandPlot className="w-4 h-4 mr-2" />
            Book Your First Court
          </Button>
        </div>
      )}

      {/* Orders Grid */}
      {!isLoading && !error && orders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {orders.map((order) => {
            const paymentStatus = order.payment?.status || "PENDING";
            return (
              <Card key={order.id} className="gap-3 p-3 hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col px-0">
                  <Image
                    src={order.bookings[0].court.image || "/paddle-court1.svg"}
                  alt={order.bookings[0].court.name}
                  className="flex-1 w-full rounded-sm"
                  width={500}
                  height={500}
                  />
                </div>
                <div className="flex flex-col text-md gap-1 px-2">
                  <div className="flex justify-between text-xs">
                    #{order.orderCode}
                    <Badge className={getPaymentStatus(paymentStatus)}>
                      {getPaymentStatusLabel(paymentStatus)}
                    </Badge>
                  </div>
                  <div className="text-foreground text-xs">
                    {formatOrderDate(order)}
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex font-medium items-center">
                      {getBookingCountText(order)}
                      <Dot width={16} height={24} strokeWidth={4} />
                      {getVenueName(order)}
                    </div>
                    <div>Rp {order.totalAmount.toLocaleString("id-ID")}</div>
                    <div className="font-regular">{order.payment?.channelName || "N/A"}</div>
                  </div>
                </div>
                <CardFooter className="min-w-0 px-1 mb-1">
                  {/* Payment Paid Button */}
                  {paymentStatus === "PAID" && (
                    <Button
                      className="w-full bg-primary"
                      onClick={() => {
                        setSelectedOrder(order);
                        setOrderModal(true);
                        setModeModal("order-details");
                      }}
                    >
                      See Details
                    </Button>
                  )}

                  {/* Payment Pending Button */}
                  {paymentStatus === "PENDING" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-2">
                      <Button
                        className="w-full border-primary"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order);
                          setOrderModal(true);
                          setModeModal("order-details");
                        }}
                      >
                        See Details
                      </Button>
                      <Button
                        className="w-full"
                        variant="default"
                        onClick={() => {
                          setSelectedOrder(order);
                          setOrderModal(true);
                          setModeModal("payment-instruction");
                        }}
                      >
                        Pay Now
                      </Button>
                    </div>
                  )}

                  {/* Payment Failed/Expired Button */}
                  {(paymentStatus === "FAILED" ||
                    paymentStatus === "EXPIRED") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-2">
                      <Button
                        className="w-full border-primary"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order);
                          setOrderModal(true);
                          setModeModal("order-details");
                        }}
                      >
                        See Details
                      </Button>
                      <Button
                        className="w-full"
                        variant="default"
                        onClick={() => {
                          setSelectedOrder(order);
                          setOrderModal(true);
                          setModeModal("payment-instruction");
                        }}
                      >
                        Re-Book
                      </Button>
                    </div>
                  )}

                  {/* Payment Refunded - Show Details Only */}
                  {paymentStatus === "REFUNDED" && (
                    <Button
                      className="w-full border-primary"
                      variant="outline"
                      onClick={() => {
                        setSelectedOrder(order);
                        setOrderModal(true);
                        setModeModal("order-details");
                      }}
                    >
                      See Details
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <OrderHistoryModal
        open={orderModal}
        onOpenChange={setOrderModal}
        orderProps={selectedOrder}
        mode={modeModal}
        onChangeMode={setModeModal}
      />
    </div>
  );
}
