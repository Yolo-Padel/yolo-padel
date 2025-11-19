import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { VenueCreateData, VenueDeleteData, VenueUpdateData } from "@/lib/validations/venue.validation";
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
  getById: async (id: string) => {
    const response = await fetch(`/api/venue/${id}`, {
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch venue");
    }
    return response.json();
  },
  create: async (data: VenueCreateData) => {
    const response = await fetch("/api/venue", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create venue");
    }
    return response.json();
  },
  update: async ({ venueId, ...data }: VenueUpdateData) => {
    const response = await fetch(`/api/venue/${venueId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update venue");
    }
    return response.json();
  },
  delete: async (data: VenueDeleteData) => {
    const response = await fetch(`/api/venue/${data.venueId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete venue");
    }
    return response.json();
  },
};

const venuePublicApi = {
  getAll: async () => {
    const response = await fetch("/api/public/venue");
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch public venues");
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

export const usePublicVenues = () => {
  return useQuery({
    queryKey: ["public-venue"],
    queryFn: venuePublicApi.getAll,
    staleTime: 1000 * 60 * 2,
  });
};

export const useVenueById = (id: string) => {
  return useQuery({
    queryKey: ["venue", id],
    queryFn: () => venueApi.getById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateVenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: venueApi.create,
    onSuccess: (data: { success: boolean; message: string }) => {
      toast.success(data.message || "Venue created successfully!");
      queryClient.invalidateQueries({ queryKey: ["venue"] });
    },
    onError: (error: Error) => {
      console.error("Create venue error:", error);
      toast.error(error.message || "Failed to create venue. Please try again.");
    },
  });
};

export const useUpdateVenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: venueApi.update,
    onSuccess: (data: { success: boolean; message: string; data?: { id: string } }) => {
      toast.success(data.message || "Venue updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["venue"] });
      if (data?.data?.id) {
        queryClient.invalidateQueries({ queryKey: ["venue", data.data.id] });
      }
    },
    onError: (error: Error) => {
      console.error("Update venue error:", error);
      toast.error(error.message || "Failed to update venue. Please try again.");
    },
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