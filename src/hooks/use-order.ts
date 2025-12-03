import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OrderStatus, PaymentStatus } from "@/types/prisma";

// ════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════

export type CreateOrderInput = {
  bookings: Array<{
    courtId: string;
    date: string | Date; // Accept string (YYYY-MM-DD) or Date for flexibility
    slots: string[]; // Format: ["07:00-08:00", "08:00-09:00"]
    price: number;
  }>;
  channelName: string;
};

export type Order = {
  id: string;
  orderCode: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    profile: {
      fullName: string;
      avatar: string | null;
    } | null;
  };
  bookings: Array<{
    id: string;
    bookingCode: string;
    courtId: string;
    bookingDate: string;
    duration: number;
    totalPrice: number;
    status: string;
    court: {
      id: string;
      name: string;
      image?: string | null;
      venue: {
        id: string;
        name: string;
        slug: string;
        images: string[];
      };
    };
    timeSlots: Array<{
      openHour: string;
      closeHour: string;
    }>;
  }>;
  payment: {
    id: string;
    channelName: string;
    amount: number;
    status: PaymentStatus;
    paymentDate: string | null;
    invoiceUrl: string;
  } | null;
};

type GetOrdersParams = {
  page?: number;
  limit?: number;
  status?: OrderStatus;
};

export type UseAdminOrdersOptions = {
  search?: string;
  venueId?: string;
  paymentStatus?: PaymentStatus;
  page?: number;
  limit?: number;
};

// ════════════════════════════════════════════════════════
// API Functions
// ════════════════════════════════════════════════════════

async function createOrderApi(data: CreateOrderInput): Promise<Order> {
  const response = await fetch("/api/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to create order");
  }

  return result.data;
}

async function getOrdersApi(params: GetOrdersParams = {}): Promise<{
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.status) searchParams.append("status", params.status);

  const response = await fetch(`/api/order?${searchParams.toString()}`);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to get orders");
  }

  return {
    data: result.data,
    pagination: result.pagination,
  };
}

async function getOrderByIdApi(orderId: string): Promise<Order> {
  const response = await fetch(`/api/order/${orderId}`);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to get order");
  }

  return result.data;
}

async function getAdminOrdersApi(options: UseAdminOrdersOptions = {}): Promise<{
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  // Subtask 4.2: Build query string from options
  const searchParams = new URLSearchParams();

  // Handle undefined/null values - only add defined values to query string
  if (options.search) searchParams.append("search", options.search);
  if (options.venueId) searchParams.append("venue", options.venueId);
  if (options.paymentStatus)
    searchParams.append("paymentStatus", options.paymentStatus);
  if (options.page) searchParams.append("page", options.page.toString());
  if (options.limit) searchParams.append("limit", options.limit.toString());

  const queryString = searchParams.toString();
  const url = queryString
    ? `/api/admin/orders?${queryString}`
    : "/api/admin/orders";

  const response = await fetch(url);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to get admin orders");
  }

  return {
    data: result.data,
    pagination: result.pagination,
  };
}

async function updateOrderStatusApi(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  const response = await fetch(`/api/order/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to update order status");
  }

  return result.data;
}

// ════════════════════════════════════════════════════════
// Hooks
// ════════════════════════════════════════════════════════

/**
 * Hook to create a new order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrderApi,
    onSuccess: (data) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Invalidate bookings list (since new bookings were created)
      queryClient.invalidateQueries({ queryKey: ["bookings"] });

      toast.success("Order created successfully!", {
        description: `Order code: ${data.orderCode}`,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to create order", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to get user's orders with pagination
 */
export function useOrders(params: GetOrdersParams = {}) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => getOrdersApi(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get all orders for admin dashboard with filtering support
 *
 * Subtask 4.1: Updated to accept options parameter with search, venueId, paymentStatus, page, limit
 * and return pagination metadata
 */
export function useAdminOrders(options: UseAdminOrdersOptions = {}) {
  // Subtask 4.3: Include filter options in query key for proper caching
  // This ensures that different filter combinations are cached separately
  return useQuery({
    queryKey: ["admin-orders", options],
    queryFn: () => getAdminOrdersApi(options),
    staleTime: 1000 * 60 * 2, // 2 minutes - shorter than default since filters change frequently
  });
}

/**
 * Hook to get order by ID
 */
export function useOrderById(orderId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => getOrderByIdApi(orderId),
    enabled: enabled && !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to update order status (admin only)
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => updateOrderStatusApi(orderId, status),
    onSuccess: (data) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Invalidate specific order
      queryClient.invalidateQueries({ queryKey: ["orders", data.id] });
      // Invalidate bookings (since booking statuses may have changed)
      queryClient.invalidateQueries({ queryKey: ["bookings"] });

      toast.success("Status order updated successfully", {
        description: `Order ${data.orderCode} sekarang ${data.status}`,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update order status", {
        description: error.message,
      });
    },
  });
}
