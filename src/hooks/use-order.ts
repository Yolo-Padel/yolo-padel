import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OrderStatus, PaymentStatus } from "@/types/prisma";

// ════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════

export type CreateOrderInput = {
  bookings: Array<{
    courtId: string;
    date: Date;
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
  } | null;
};

type GetOrdersParams = {
  page?: number;
  limit?: number;
  status?: OrderStatus;
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

      toast.success("Order berhasil dibuat!", {
        description: `Order code: ${data.orderCode}`,
      });
    },
    onError: (error: Error) => {
      toast.error("Gagal membuat order", {
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

      toast.success("Status order berhasil diupdate", {
        description: `Order ${data.orderCode} sekarang ${data.status}`,
      });
    },
    onError: (error: Error) => {
      toast.error("Gagal update status order", {
        description: error.message,
      });
    },
  });
}
