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
        errorData.message ||
          "Failed to fetch super admin dashboard snapshot"
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
