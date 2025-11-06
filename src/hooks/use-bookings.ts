import { useQuery } from "@tanstack/react-query";
import { Booking, PaymentStatus } from "@/types/prisma";

// Booking shape returned by API (includes relations)
export type BookingWithRelations = Booking & {
  court: {
    id: string;
    name: string;
    venue: {
      id: string;
      name: string;
      slug: string;
      city: string;
      images: string[];
    };
  };
  user: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      avatar: string;
    } | null;
  };
  payments: {
    id: string;
    amount: number;
    status: PaymentStatus;
    paymentDate: string;
    channelName: string;
  }[];
  blocking?: {
    id: string;
    description: string;
    isBlocking: boolean;
    // Optional fields based on current DB schema
    timerange?: string;
    createdAt?: string;
    updatedAt?: string;
  } | null;
};

interface BookingsResponse {
  success: boolean;
  data: BookingWithRelations[] | null;
  message: string;
  errors?: any[];
}

interface BookingByIdResponse {
  success: boolean;
  data: BookingWithRelations | null;
  message: string;
  errors?: any[];
}

const bookingsApi = {
  getAll: async (): Promise<BookingsResponse> => {
    const response = await fetch("/api/booking", {
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch bookings");
    }
    return response.json();
  },

  getById: async (id: string): Promise<BookingByIdResponse> => {
    const response = await fetch(`/api/booking/${id}`, {
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch booking");
    }
    return response.json();
  },
};

export const useBookings = () => {
  return useQuery<BookingsResponse>({
    queryKey: ["bookings"],
    queryFn: bookingsApi.getAll,
    staleTime: 1000 * 60 * 5,
  });
};

export const useBookingById = (id: string) => {
  return useQuery<BookingByIdResponse>({
    queryKey: ["booking", id],
    queryFn: () => bookingsApi.getById(id),
    staleTime: 1000 * 60 * 5,
  });
};
