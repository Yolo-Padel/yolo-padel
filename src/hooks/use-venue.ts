import { useQuery } from "@tanstack/react-query";

const venueApi = {
  getAll: async () => {
    const response = await fetch("/api/venue", {
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch venues");
    }
    return response.json();
  },
};

export const useVenue = () => {
  return useQuery({
    queryKey: ["venue"],
    queryFn: venueApi.getAll,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};