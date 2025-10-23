import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { VenueDeleteData } from "@/lib/validations/venue.validation";
import { toast } from "sonner";

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
  delete: async (data: VenueDeleteData) => {
    const response = await fetch("/api/venue", {
      method: "DELETE",
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete venue");
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

export const useDeleteVenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: venueApi.delete,
    onSuccess: (data: { success: boolean; message: string }) => {
      toast.success(data.message || "Venue deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["venue"] });
    },
    onError: (error: Error) => {
      console.error("Delete venue error:", error);
      toast.error(error.message || "Failed to delete venue. Please try again.");
    },
  });
};