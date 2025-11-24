"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, MoreHorizontal, Eye } from "lucide-react";
import { generatePageNumbers } from "@/lib/pagination-utils";
import { PaymentStatus } from "@/types/prisma";
import { type Order } from "@/hooks/use-order";
import {
  formatCurrency,
  getPaymentStatusClass,
  formatPaymentStatus,
} from "@/lib/order-utils";
import { cn } from "@/lib/utils";

export interface PaginationInfo {
  pageSafe: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface OrderTableProps {
  orders: Order[];
  paginationInfo: PaginationInfo;
  onPageChange: (page: number) => void;
  onViewOrder: (order: Order) => void;
}

export function OrderTable({
  orders,
  paginationInfo,
  onPageChange,
  onViewOrder,
}: OrderTableProps) {
  const paginationButtonBaseClass =
    "w-8 h-8 p-0 bg-[#FAFAFA] border border-[#E9EAEB] text-[#A4A7AE] hover:bg-[#E9EAEB]";
  const paginationButtonActiveClass =
    "bg-primary text-black border-primary hover:bg-primary";

  return (
    <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="h-11">Order Code</TableHead>
            <TableHead className="h-11">Customer</TableHead>
            <TableHead className="h-11">Total Booking</TableHead>
            <TableHead className="h-11">Amount</TableHead>
            <TableHead className="h-11">Payment Status</TableHead>

            <TableHead className="h-11 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const bookingCount = order.bookings.length;
            const customerName =
              order.user?.profile?.fullName || order.user?.email || "-";
            const paymentStatus = order.payment?.status || PaymentStatus.UNPAID;

            return (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{order.orderCode}</span>
                  </div>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={order.user?.profile?.avatar || ""} />
                    <AvatarFallback className="uppercase">
                      {customerName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {customerName}
                </TableCell>
                <TableCell>
                  {bookingCount} {bookingCount === 1 ? "booking" : "bookings"}
                </TableCell>
                <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                <TableCell>
                  <Badge
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getPaymentStatusClass(paymentStatus)}`}
                  >
                    {formatPaymentStatus(paymentStatus)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewOrder(order)}
                    className="border-none shadow-none"
                  >
                    <Eye className="size-4 text-[#A4A7AE]" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter className="bg-transparent">
          <TableRow>
            <TableCell colSpan={6} className="p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!paginationInfo.hasPreviousPage}
                  onClick={() => onPageChange(paginationInfo.pageSafe - 1)}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {generatePageNumbers(
                    paginationInfo.pageSafe,
                    paginationInfo.totalPages
                  ).map((pageNum, index) => (
                    <div key={index}>
                      {pageNum === "..." ? (
                        <div className="flex items-center justify-center w-8 h-8 bg-background border border-[#E9EAEB] text-[#A4A7AE]">
                          <MoreHorizontal className="w-4 h-4" />
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPageChange(pageNum as number)}
                          className={cn(
                            paginationButtonBaseClass,
                            pageNum === paginationInfo.pageSafe &&
                              paginationButtonActiveClass
                          )}
                        >
                          {pageNum}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!paginationInfo.hasNextPage}
                  onClick={() => onPageChange(paginationInfo.pageSafe + 1)}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
