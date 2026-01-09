import { useQuery } from "@tanstack/react-query";

// ════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════

/**
 * AYO Field entity from list-fields API
 * Represents a court/field in the AYO system
 */
export interface AyoField {
  id: number;
  name: string;
  venue_name: string;
}

/**
 * Response from internal API endpoint
 */
export interface AyoFieldsResponse {
  success: boolean;
  data: AyoField[];
  message: string;
}

// ════════════════════════════════════════════════════════
// API Functions
// ════════════════════════════════════════════════════════

/**
 * Fetches AYO fields from internal API endpoint
 * @throws Error if request fails or response is not successful
 */
async function getAyoFieldsApi(): Promise<AyoFieldsResponse> {
  const response = await fetch("/api/admin/ayo/fields", {
    credentials: "include",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to fetch AYO fields");
  }

  return result;
}

// ════════════════════════════════════════════════════════
// Hooks
// ════════════════════════════════════════════════════════

/**
 * Hook to fetch AYO fields for reference in Court Modal
 *
 * @param enabled - Controls whether the query should execute (default: true)
 * @returns React Query result with AYO fields data
 *
 * Features:
 * - 5-minute staleTime for caching (reduces API calls)
 * - Enabled parameter to control fetching (useful for modal open/close)
 * - Automatic error handling via React Query
 *
 * Requirements: 3.1
 */
export function useAyoFields(enabled: boolean = true) {
  return useQuery({
    queryKey: ["ayo-fields"],
    queryFn: getAyoFieldsApi,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
