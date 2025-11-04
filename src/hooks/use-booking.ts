import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { transformUISlotsToDbFormat } from "@/lib/booking-slots-utils";

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

    const response = await fetch("/api/booking", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courtId: data.courtId,
        userId: data.userId,
        source: "YOLO system",
        bookingDate: data.date.toISOString(),
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
};

export const useBooking = () => {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: bookingApi.getAll,
    staleTime: 1000 * 60 * 2, // 2 minutes
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
