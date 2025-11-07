import { useQuery } from "@tanstack/react-query";
import { TIMETABLE_CACHE } from "@/constants/timetable";

// ════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════

export type BlockingTimeSlot = {
  openHour: string;
  closeHour: string;
};

export type ActiveBlocking = {
  id: string;
  bookingId: string;
  isBlocking: boolean;
  booking: {
    id: string;
    courtId: string;
    bookingDate: string;
    timeSlots: BlockingTimeSlot[];
  };
};

export type VenueBlockingData = {
  id: string;
  bookingId: string;
  isBlocking: boolean;
  booking: {
    id: string;
    courtId: string;
    userId: string;
    bookingDate: string | Date;
    status: string;
    timeSlots: Array<{
      openHour: string;
      closeHour: string;
    }>;
    user: {
      profile: {
        fullName: string | null;
        avatar: string | null;
      } | null;
    };
    court: {
      id: string;
      name: string;
    };
  };
};

type GetBlockingsParams = {
  courtId: string;
  date: Date;
};

// ════════════════════════════════════════════════════════
// API Functions
// ════════════════════════════════════════════════════════

async function getActiveBlockingsApi(
  params: GetBlockingsParams
): Promise<ActiveBlocking[]> {
  const { courtId, date } = params;
  const dateStr = date.toISOString();

  const url = `/api/blocking?courtId=${encodeURIComponent(courtId)}&date=${encodeURIComponent(dateStr)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to fetch blockings");
  }

  return result.data;
}

// ════════════════════════════════════════════════════════
// Hooks
// ════════════════════════════════════════════════════════

/**
 * Hook to get active blockings for a specific court and date
 * Used for checking slot availability in booking form
 */
export function useActiveBlockings(params: GetBlockingsParams) {
  return useQuery({
    queryKey: ["blockings", params.courtId, params.date.toISOString()],
    queryFn: () => getActiveBlockingsApi(params),
    staleTime: TIMETABLE_CACHE.BLOCKING_STALE_TIME,
    enabled: !!params.courtId && !!params.date,
  });
}

/**
 * Fetch blockings for all courts in a venue
 */
async function getBlockingsByVenueAndDateApi(
  venueId: string,
  date: Date
): Promise<VenueBlockingData[]> {
  const dateStr = date.toISOString();

  const url = `/api/blocking/venue?venueId=${encodeURIComponent(venueId)}&date=${encodeURIComponent(dateStr)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to fetch venue blockings");
  }

  return result.data;
}

/**
 * Hook to get active blockings for all courts in a venue
 * Used for timetable display in admin dashboard
 */
export function useBlockingByVenueAndDate(venueId: string, date: Date) {
  return useQuery({
    queryKey: ["blockings", "venue", venueId, date.toISOString()],
    queryFn: () => getBlockingsByVenueAndDateApi(venueId, date),
    staleTime: TIMETABLE_CACHE.BLOCKING_STALE_TIME,
    enabled: !!venueId && !!date,
  });
}
