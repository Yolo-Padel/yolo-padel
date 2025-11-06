import { useQuery } from "@tanstack/react-query";

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
    staleTime: 1000 * 30, // 30 seconds - blockings change frequently
    enabled: !!params.courtId && !!params.date, // Only fetch if both params are provided
  });
}

