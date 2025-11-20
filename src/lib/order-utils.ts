import { OrderStatus, PaymentStatus } from "@/types/prisma";
import { Order } from "@/hooks/use-order";

/**
 * Formats a number as Indonesian Rupiah currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "Rp 100.000")
 */
export function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

/**
 * Returns the appropriate CSS classes for payment status badges
 * @param status - The payment status
 * @returns CSS class string for badge styling
 */
export function getPaymentStatusClass(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.PAID:
      return "bg-[#D5FFD5] text-[#1FAD53]";
    case PaymentStatus.UNPAID:
      return "bg-[#FFF5D5] text-[#AD751F]";
    case PaymentStatus.FAILED:
    case PaymentStatus.EXPIRED:
      return "bg-[#FFD5D5] text-[#AD1F1F]";
    default:
      return "bg-gray-500 text-white";
  }
}

/**
 * Returns the appropriate CSS classes for order status badges
 * @param status - The order status
 * @returns CSS class string for badge styling
 */
export function getOrderStatusClass(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PAID:
    case OrderStatus.COMPLETED:
      return "bg-[#D0FBE9] text-[#1A7544]";
    case OrderStatus.PENDING:
      return "bg-[#FFF5D5] text-[#AD751F]";
    case OrderStatus.FAILED:
    case OrderStatus.EXPIRED:
      return "bg-[#FFD5D5] text-[#AD1F1F]";
    default:
      return "bg-gray-200 text-gray-700";
  }
}

/**
 * Formats payment status to normal capitalized case
 * @param status - The payment status
 * @returns Formatted status string (e.g., "Paid", "Pending")
 */
export function formatPaymentStatus(status: PaymentStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

/**
 * Formats order status to normal capitalized case
 * @param status - The order status
 * @returns Formatted status string (e.g., "Paid", "Pending")
 */
export function formatOrderStatus(status: OrderStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

/**
 * Filters orders based on search query from URL search parameters
 * Searches across order code, payment status, and order status
 * @param orders - Array of orders to filter
 * @param searchParams - URLSearchParams containing the search query
 * @returns Filtered array of orders
 */
export function filterOrders(
  orders: Order[],
  searchParams: URLSearchParams
): Order[] {
  const query = searchParams.get("search")?.toLowerCase().trim();

  if (!query) {
    return orders;
  }

  return orders.filter((order) => {
    const paymentStatus = order.payment?.status || "";

    return (
      order.orderCode.toLowerCase().includes(query) ||
      paymentStatus.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query)
    );
  });
}
