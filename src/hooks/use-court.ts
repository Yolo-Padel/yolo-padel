import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CourtCreateData } from "@/lib/validations/court.validation";
import { toast } from "sonner";

const courtApi = {
  getAll: async () => {
    const response = await fetch("/api/court", {
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch courts");
    }
    return response.json();
  },
  getByVenue: async (venueId: string) => {
    const response = await fetch(`/api/court?venueId=${venueId}`, {
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch courts by venue");
    }
    return response.json();
  },
  getById: async (id: string) => {
    const response = await fetch(`/api/court/${id}`, {
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch court");
    }
    return response.json();
  },
  create: async (data: CourtCreateData) => {
    const response = await fetch("/api/court", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create court");
    }
    return response.json();
  },
  update: async ({ courtId, ...data }: any) => {
    const response = await fetch(`/api/court/${courtId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update court");
    }
    return response.json();
  },
  delete: async (courtId: string) => {
    const response = await fetch(`/api/court/${courtId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete court");
    }
    return response.json();
  },
  toggleAvailability: async (courtId: string) => {
    const response = await fetch(`/api/court/${courtId}/toggle`, {
      method: "PATCH",
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to toggle court availability"
      );
    }
    return response.json();
  },
  getAvailableTimeSlots: async (courtId: string, date: Date) => {
    const dateStr = date.toISOString();
    const response = await fetch(
      `/api/court/${courtId}/available-slots?date=${dateStr}`,
      {
        credentials: "include",
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to fetch available time slots"
      );
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Failed to fetch available time slots");
    }
    return result.data;
  },
};

const courtPublicApi = {
  getByVenue: async (venueId: string) => {
    const response = await fetch(`/api/public/court?venueId=${venueId}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to fetch public courts by venue"
      );
    }
    return response.json();
  },
};

export const useCourt = () => {
  return useQuery({
    queryKey: ["court"],
    queryFn: courtApi.getAll,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCourtByVenue = (venueId: string) => {
  return useQuery({
    queryKey: ["court", "venue", venueId],
    queryFn: () => courtApi.getByVenue(venueId),
    enabled: Boolean(venueId),
    staleTime: 1000 * 60 * 2,
  });
};

export const usePublicCourtByVenue = (venueId: string) => {
  return useQuery({
    queryKey: ["public-court", "venue", venueId],
    queryFn: () => courtPublicApi.getByVenue(venueId),
    enabled: Boolean(venueId),
    refetchInterval: 1000,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCourtById = (id: string) => {
  return useQuery({
    queryKey: ["court", id],
    queryFn: () => courtApi.getById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateCourt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courtApi.create,
    onSuccess: (data: { success: boolean; message: string }) => {
      toast.success(data.message || "Court created successfully!");
      queryClient.invalidateQueries({ queryKey: ["court"] });
    },
    onError: (error: Error) => {
      console.error("Create court error:", error);
      toast.error(error.message || "Failed to create court. Please try again.");
    },
  });
};

export const useUpdateCourt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courtApi.update,
    onSuccess: (data: {
      success: boolean;
      message: string;
      data?: { id: string };
    }) => {
      toast.success(data.message || "Court updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["court"] });
      if (data?.data?.id) {
        queryClient.invalidateQueries({ queryKey: ["court", data.data.id] });
      }
    },
    onError: (error: Error) => {
      console.error("Update court error:", error);
      toast.error(error.message || "Failed to update court. Please try again.");
    },
  });
};

export const useDeleteCourt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courtApi.delete,
    onSuccess: (data: { success: boolean; message: string }) => {
      toast.success(data.message || "Court deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["court"] });
    },
    onError: (error: Error) => {
      console.error("Delete court error:", error);
      toast.error(error.message || "Failed to delete court. Please try again.");
    },
  });
};

export const useToggleCourtAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courtApi.toggleAvailability,
    onSuccess: (data: { success: boolean; message: string }) => {
      toast.success(data.message || "Court availability updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["court"] });
    },
    onError: (error: Error) => {
      console.error("Toggle court availability error:", error);
      toast.error(
        error.message ||
          "Failed to update court availability. Please try again."
      );
    },
  });
};

export const useAvailableTimeSlots = (
  courtId: string,
  date: Date | undefined
) => {
  return useQuery({
    queryKey: ["court", "available-slots", courtId, date?.toISOString()],
    queryFn: () => courtApi.getAvailableTimeSlots(courtId, date!),
    enabled: Boolean(courtId && date),
    staleTime: 1000 * 30, // 30 seconds - short cache since availability changes frequently
  });
};
