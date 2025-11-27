import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  transformUISlotsToDbFormat,
  normalizeDateToLocalStartOfDay,
} from "@/lib/booking-slots-utils";
import type { ManualBookingInput } from "@/lib/validations/manual-booking.validation";
import type {
  AdminDashboardSnapshot,
  SuperAdminDashboardSnapshot,
} from "@/types/booking-dashboard";
import type { BookingStatus } from "@/types/prisma";

interface DashboardSnapshotResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}

const bookingApi = {
  getAll: async () => {
    const response = await fetch("/api/booking", {
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch bookings");
    }
    return response.json();
  },
  getByUser: async (userId: string) => {
    const response = await fetch(`/api/booking?userId=${userId}`, {
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch bookings by user");
    }
    return response.json();
  },
  getByCourt: async (courtId: string) => {
    const response = await fetch(`/api/booking?courtId=${courtId}`, {
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch bookings by court");
    }
    return response.json();
  },
  getByStatus: async (status: string) => {
    const response = await fetch(`/api/booking?status=${status}`, {
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to fetch bookings by status"
      );
    }
    return response.json();
  },
  getByVenueAndDate: async (venueId: string, date: Date) => {
    const dateStr = date.toISOString();
    const response = await fetch(
      `/api/booking?venueId=${venueId}&date=${dateStr}`,
      {
        credentials: "include",
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to fetch bookings by venue and date"
      );
    }
    return response.json();
  },
  getById: async (id: string) => {
    const response = await fetch(`/api/booking/${id}`, {
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch booking by id");
    }
    return response.json();
  },
  create: async (data: {
    courtId: string;
    date: Date;
    slots: string[]; // UI format: ["06.00–07.00", ...]
    totalPrice: number;
    userId: string; // User ID from auth
  }) => {
    const timeSlots = transformUISlotsToDbFormat(data.slots);

    // Normalize date to prevent timezone issues
    // This ensures the date selected by user (e.g., Nov 9) is preserved
    // regardless of timezone conversion
    const normalizedDate = normalizeDateToLocalStartOfDay(data.date);

    const response = await fetch("/api/booking", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courtId: data.courtId,
        userId: data.userId,
        source: "YOLO system",
        bookingDate: normalizedDate,
        timeSlots,
        duration: data.slots.length,
        totalPrice: data.totalPrice,
        status: "PENDING",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create booking");
    }

    return response.json();
  },
  createManual: async (payload: ManualBookingInput) => {
    const response = await fetch("/api/booking/manual", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to create manual booking");
    }

    return data;
  },
  getSuperAdminDashboardSnapshot: async (): Promise<
    DashboardSnapshotResponse<SuperAdminDashboardSnapshot>
  > => {
    const response = await fetch("/api/dashboard/bookings/super-admin", {
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to fetch super admin dashboard snapshot"
      );
    }
    return response.json();
  },
  getAdminDashboardSnapshot: async (): Promise<
    DashboardSnapshotResponse<AdminDashboardSnapshot>
  > => {
    const response = await fetch("/api/dashboard/bookings/admin", {
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to fetch admin dashboard snapshot"
      );
    }
    return response.json();
  },
  cancel: async (id: string) => {
    const response = await fetch(`/api/booking/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to cancel booking");
    }

    return data;
  },
};

export const useBooking = () => {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: bookingApi.getAll,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useBookingByVenueAndDate = (venueId: string, date: Date) => {
  return useQuery({
    queryKey: ["bookings", "venue", venueId, date.toISOString()],
    queryFn: () => bookingApi.getByVenueAndDate(venueId, date),
    enabled: Boolean(venueId),
    staleTime: 1000 * 60 * 1, // 1 minute (untuk data real-time)
  });
};

export const useBookingByUser = (userId: string) => {
  return useQuery({
    queryKey: ["bookings", userId],
    queryFn: () => bookingApi.getByUser(userId),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useBookingByCourt = (courtId: string) => {
  return useQuery({
    queryKey: ["bookings", courtId],
    queryFn: () => bookingApi.getByCourt(courtId),
    enabled: Boolean(courtId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useBookingByStatus = (status: string) => {
  return useQuery({
    queryKey: ["bookings", status],
    queryFn: () => bookingApi.getByStatus(status),
    enabled: Boolean(status),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useBookingById = (id: string) => {
  return useQuery({
    queryKey: ["bookings", id],
    queryFn: () => bookingApi.getById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingApi.create,
    onSuccess: () => {
      toast.success("Booking created successfully!");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: Error) => {
      console.error("Create booking error:", error);
      toast.error(error.message || "Failed to create booking");
    },
  });
};

type DashboardHookOptions = {
  enabled?: boolean;
};

export const useSuperAdminBookingDashboard = (
  options: DashboardHookOptions = {}
) => {
  return useQuery({
    queryKey: ["booking-dashboard", "super-admin"],
    queryFn: bookingApi.getSuperAdminDashboardSnapshot,
    staleTime: 1000 * 60, // 1 minute
    enabled: options.enabled ?? true,
  });
};

export const useAdminBookingDashboard = (
  options: DashboardHookOptions = {}
) => {
  return useQuery({
    queryKey: ["booking-dashboard", "admin"],
    queryFn: bookingApi.getAdminDashboardSnapshot,
    staleTime: 1000 * 60, // 1 minute
    enabled: options.enabled ?? true,
  });
};

export const useManualBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingApi.createManual,
    onSuccess: (data: { message?: string }) => {
      toast.success(data.message || "Manual booking created successfully!");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["blockings"] });
    },
    onError: (error: Error) => {
      console.error("Manual booking error:", error);
      toast.error(error.message || "Failed to create manual booking");
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingApi.cancel,
    onSuccess: (data: { message?: string }) => {
      toast.success(data.message || "Booking cancelled successfully!");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["blockings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-dashboard"] });
    },
    onError: (error: Error) => {
      console.error("Cancel booking error:", error);
      toast.error(error.message || "Failed to cancel booking");
    },
  });
};

// ════════════════════════════════════════════════════════
// Admin Bookings with Filtering
// ════════════════════════════════════════════════════════

/**
 * Options for filtering admin bookings
 * Matches the filter state from useBookingFilters hook
 */
export interface UseAdminBookingsOptions {
  search?: string;
  venueId?: string;
  status?: BookingStatus | string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Response type for admin bookings API
 */
interface AdminBookingsResponse {
  success: boolean;
  message: string;
  data: Array<{
    id: string;
    bookingCode: string;
    bookingDate: Date;
    duration: number;
    totalPrice: number;
    status: BookingStatus;
    createdAt: Date;
    updatedAt: Date;
    timeSlots: Array<{
      id: string;
      openHour: string;
      closeHour: string;
    }>;
    user: {
      id: string;
      email: string;
      profile: {
        fullName: string;
        avatar: string | null;
      } | null;
    };
    court: {
      id: string;
      name: string;
      venue: {
        id: string;
        name: string;
        city: string;
      };
    };
    order: {
      id: string;
      orderCode: string;
      status: string;
      totalAmount: number;
    } | null;
    payments: Array<{
      id: string;
      amount: number;
      status: string;
      paymentDate: Date | null;
      channelName: string | null;
    }>;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API function to fetch admin bookings with filters
 */
async function getAdminBookingsApi(
  options: UseAdminBookingsOptions = {}
): Promise<AdminBookingsResponse> {
  // Build query parameters from filter options
  const searchParams = new URLSearchParams();

  // Only add defined values to query string
  if (options.search) searchParams.append("search", options.search);
  if (options.venueId) searchParams.append("venue", options.venueId);
  if (options.status) searchParams.append("status", options.status);
  if (options.startDate) searchParams.append("startDate", options.startDate);
  if (options.endDate) searchParams.append("endDate", options.endDate);
  if (options.page) searchParams.append("page", options.page.toString());
  if (options.limit) searchParams.append("limit", options.limit.toString());

  // Build URL with query string
  const queryString = searchParams.toString();
  const url = queryString
    ? `/api/admin/bookings?${queryString}`
    : "/api/admin/bookings";

  // Fetch from API endpoint
  const response = await fetch(url, {
    credentials: "include",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to fetch admin bookings");
  }

  return result;
}

/**
 * Hook to fetch bookings for admin dashboard with filtering support
 *
 * Features:
 * - Server-side filtering (search, venue, status, date range)
 * - Pagination support
 * - React Query caching (staleTime: 30s, cacheTime: 5min)
 * - Automatic refetch on filter changes
 * - Loading and error states
 *
 * @param options - Filter options (search, venueId, status, startDate, endDate, page, limit)
 * @returns React Query result with data, loading, and error states
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAdminBookings({
 *   search: "BK-123",
 *   venueId: "venue-id",
 *   status: "UPCOMING",
 *   page: 1,
 *   limit: 10
 * });
 * ```
 */
export function useAdminBookings(options: UseAdminBookingsOptions = {}) {
  return useQuery({
    // Include filter options in query key for proper cache invalidation
    // Different filter combinations will be cached separately
    queryKey: ["admin-bookings", options],
    queryFn: () => getAdminBookingsApi(options),
    // Cache configuration as per requirements
    staleTime: 30000, // 30 seconds - data is considered fresh for 30s
    gcTime: 300000, // 5 minutes - cache time (formerly cacheTime in v4)
    // Disable automatic refetch on window focus to prevent unnecessary requests
    refetchOnWindowFocus: false,
  });
}
