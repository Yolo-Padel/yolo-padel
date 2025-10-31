import { useQuery } from "@tanstack/react-query";


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
            throw new Error(errorData.message || "Failed to fetch bookings by status");
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
}

export const useBooking = () => {
    return useQuery({
        queryKey: ["bookings"],
        queryFn: bookingApi.getAll,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

export const useBookingByUser = (userId: string) => {
    return useQuery({
        queryKey: ["bookings", userId],
        queryFn: () => bookingApi.getByUser(userId),
        enabled: Boolean(userId),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

export const useBookingByCourt = (courtId: string) => {
    return useQuery({
        queryKey: ["bookings", courtId],
        queryFn: () => bookingApi.getByCourt(courtId),
        enabled: Boolean(courtId),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

export const useBookingByStatus = (status: string) => {
    return useQuery({
        queryKey: ["bookings", status],
        queryFn: () => bookingApi.getByStatus(status),
        enabled: Boolean(status),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

export const useBookingById = (id: string) => {
    return useQuery({
        queryKey: ["bookings", id],
        queryFn: () => bookingApi.getById(id),
        enabled: Boolean(id),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}