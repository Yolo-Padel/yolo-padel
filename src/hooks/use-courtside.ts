import { Blocking } from "@/lib/services/courtside.service";
import {
  GetCourtsideBooking,
  GetCourtsideBookingsByVenue,
} from "@/lib/validations/courtside.validation";
import { useQuery } from "@tanstack/react-query";

interface CourtsideBookingResponse {
  success: boolean;
  data: Blocking[];
}

const courtsideApi = {
  getCourtsideBooking: async (data: GetCourtsideBooking) => {
    const response = await fetch("/api/booking/courtside", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result: CourtsideBookingResponse = await response.json();

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to fetch courtside bookings",
      );
    }
    return result.data;
  },

  getCourtsideBookingsByVenue: async (data: GetCourtsideBookingsByVenue) => {
    const response = await fetch("/api/booking/courtside/venue", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result: CourtsideBookingResponse = await response.json();

    if (!response.ok) {
      throw new Error("Failed to fetch courtside bookings by venue");
    }
    return result.data;
  },
};

export const useActiveCourtsideBlockings = (data: GetCourtsideBooking) => {
  return useQuery({
    queryKey: ["activeBlockings", data.courtsideCourtId, data.bookingDate],
    queryFn: () => courtsideApi.getCourtsideBooking(data),
    enabled: !!data.bookingDate && !!data.courtsideCourtId && !!data.apiKey,
  });
};

export const useCourtsideBlockingsByVenue = (
  data: GetCourtsideBookingsByVenue,
) => {
  return useQuery({
    queryKey: ["courtsideBlockingsByVenue", data.venueId, data.bookingDate],
    queryFn: () => courtsideApi.getCourtsideBookingsByVenue(data),
    enabled: !!data.venueId && !!data.bookingDate,
  });
};
