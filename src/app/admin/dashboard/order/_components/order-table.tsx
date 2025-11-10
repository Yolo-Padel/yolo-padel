"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { ChevronLeft, ChevronRight, MoreHorizontal, Eye } from "lucide-react";
import {
  calculatePaginationInfo,
  generatePageNumbers,
  getPaginatedData,
} from "@/lib/pagination-utils";
import { OrderStatus, PaymentStatus } from "@/types/prisma";
import { useOrders, type Order } from "@/hooks/use-order";
import { OrderTableLoading } from "./order-table-loading";
import { OrderEmptyState } from "./order-empty-state";
import { OrderDetailsModal } from "./order-details-modal";

const PAGE_SIZE = 10;

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function getPaymentStatusClass(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.PAID:
      return "bg-[#D5FFD5] text-[#1FAD53]";
    case PaymentStatus.PENDING:
      return "bg-[#FFF5D5] text-[#AD751F]";
    case PaymentStatus.FAILED:
    case PaymentStatus.EXPIRED:
      return "bg-[#FFD5D5] text-[#AD1F1F]";
    case PaymentStatus.REFUNDED:
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-500 text-white";
  }
}

function getOrderStatusClass(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PAID:
    case OrderStatus.COMPLETED:
      return "bg-[#D0FBE9] text-[#1A7544]";
    case OrderStatus.PENDING:
      return "bg-[#FFF5D5] text-[#AD751F]";
    case OrderStatus.CANCELLED:
      return "bg-[#FFD5D5] text-[#AD1F1F]";
    case OrderStatus.EXPIRED:
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-200 text-gray-700";
  }
}

export function OrderTable() {
  const [page, setPage] = useState(1);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const searchParams = useSearchParams();

  // Fetch order data using the hook
  const { data: response, isLoading, error } = useOrders();

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [searchParams]);

  // Extract orders from response
  const allOrders = useMemo(() => {
    if (!response?.data) return [];
    return response.data as Order[];
  }, [response]);

  // Filter orders based on search query
  const filtered = useMemo(() => {
    const q = searchParams.get("search")?.toLowerCase().trim();
    if (!q) return allOrders;
    return allOrders.filter((order) => {
      // Get payment status
      const paymentStatus = order.payment?.status || "";

      return (
        order.orderCode.toLowerCase().includes(q) ||
        paymentStatus.toLowerCase().includes(q) ||
        order.status.toLowerCase().includes(q)
      );
    });
  }, [allOrders, searchParams]);

  const paginationInfo = useMemo(
    () => calculatePaginationInfo(page, filtered.length, PAGE_SIZE),
    [page, filtered.length]
  );

  const paginated = useMemo(
    () => getPaginatedData(filtered, page, PAGE_SIZE),
    [filtered, page]
  );

  // Show loading state
  if (isLoading) {
    return <OrderTableLoading />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Order List</h2>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E9EAEB] p-8 text-center">
          <p className="text-red-600 font-medium mb-2">Failed to load orders</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "An error occurred while fetching orders"}
          </p>
        </div>
      </div>
    );
  }

  // Show empty state
  const isFiltered = Boolean(searchParams.get("search"));
  if (filtered.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Order List</h2>
            <Badge className="text-[#6941C6] bg-[#F9F5FF] border-[#E9D7FE] shadow-none rounded-4xl">
              {allOrders.length} {allOrders.length === 1 ? "order" : "orders"}
            </Badge>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
          <OrderEmptyState isFiltered={isFiltered} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Order List</h2>
          <Badge className="text-[#6941C6] bg-[#F9F5FF] border-[#E9D7FE] shadow-none rounded-4xl">
            {filtered.length} {filtered.length === 1 ? "order" : "orders"}
          </Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-11">Order Code</TableHead>
              <TableHead className="h-11">Customer</TableHead>
              <TableHead className="h-11">Amount</TableHead>
              <TableHead className="h-11">Payment Status</TableHead>
              <TableHead className="h-11">Order Status</TableHead>
              <TableHead className="h-11 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((order) => {
              const bookingCount = order.bookings.length;
              // Customer name will be available when API includes user data
              const customerName = "N/A";
              const paymentStatus =
                order.payment?.status || PaymentStatus.PENDING;

              return (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{order.orderCode}</span>
                      <span className="text-xs text-muted-foreground">
                        {bookingCount}{" "}
                        {bookingCount === 1 ? "booking" : "bookings"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{customerName}</TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getPaymentStatusClass(paymentStatus)}`}
                    >
                      {paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getOrderStatusClass(order.status)}`}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelected(order);
                        setViewOpen(true);
                      }}
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
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                            variant={
                              pageNum === paginationInfo.pageSafe
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setPage(pageNum as number)}
                            className="w-8 h-8 p-0 bg-[#FAFAFA] border border-[#E9EAEB] text-[#A4A7AE] hover:bg-[#E9EAEB]"
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
                    onClick={() =>
                      setPage((p) => Math.min(paginationInfo.totalPages, p + 1))
                    }
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

      <OrderDetailsModal
        open={viewOpen}
        onOpenChange={setViewOpen}
        order={selected}
      />
    </div>
  );
}
