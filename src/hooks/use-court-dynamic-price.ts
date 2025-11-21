import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CourtDynamicPriceCreateData,
  CourtDynamicPriceUpdateData,
} from "@/lib/validations/court-dynamic-price.validation";
import {
  groupDynamicPricesByCourt,
  PrismaDynamicPrice,
  transformPrismaDynamicPrice,
} from "@/lib/dynamic-price-transform";
import type { DynamicPrice } from "@/components/timetable-types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const dynamicPriceApi = {
  async listByCourt(courtId: string): Promise<DynamicPrice[]> {
    const response = await fetch(
      `/api/court-dynamic-prices?courtId=${courtId}`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch dynamic prices");
    }

    const json = (await response.json()) as ApiResponse<unknown>;

    if (!json.success) {
      throw new Error(json.message || "Failed to fetch dynamic prices");
    }

    const data = Array.isArray(json.data)
      ? (json.data as PrismaDynamicPrice[])
      : [];

    return data.map(transformPrismaDynamicPrice);
  },

  async listByCourts(courtIds: string[]): Promise<DynamicPrice[]> {
    if (courtIds.length === 0) return [];

    const results = await Promise.all(
      courtIds.map((courtId) => dynamicPriceApi.listByCourt(courtId))
    );

    return results.flat();
  },

  async getById(id: string): Promise<DynamicPrice> {
    const response = await fetch(`/api/court-dynamic-prices/${id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch dynamic price");
    }

    const json = (await response.json()) as ApiResponse<unknown>;

    if (!json.success || !json.data) {
      throw new Error(json.message || "Failed to fetch dynamic price");
    }

    return transformPrismaDynamicPrice(json.data as any);
  },

  async create(data: CourtDynamicPriceCreateData) {
    console.log("PAYLOAD", data);
    const response = await fetch("/api/court-dynamic-prices", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create dynamic price");
    }

    return (await response.json()) as ApiResponse<unknown>;
  },

  async update(id: string, data: CourtDynamicPriceUpdateData) {
    const response = await fetch(`/api/court-dynamic-prices/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update dynamic price");
    }

    return (await response.json()) as ApiResponse<unknown>;
  },

  async delete(id: string) {
    const response = await fetch(`/api/court-dynamic-prices/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete dynamic price");
    }

    return (await response.json()) as ApiResponse<unknown>;
  },
};

export const useCourtDynamicPrices = (courtIds: string[]) => {
  const sortedIds = [...courtIds].sort();

  return useQuery({
    queryKey: ["court-dynamic-prices", sortedIds],
    queryFn: () => dynamicPriceApi.listByCourts(sortedIds),
    enabled: sortedIds.length > 0,
    staleTime: 60_000,
    select: (prices: DynamicPrice[]) => ({
      list: prices,
      byCourt: groupDynamicPricesByCourt(prices),
    }),
  });
};

export const useCourtDynamicPrice = (id: string) => {
  return useQuery({
    queryKey: ["court-dynamic-price", id],
    queryFn: () => dynamicPriceApi.getById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
};

export const useCreateCourtDynamicPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dynamicPriceApi.create,
    onSuccess: (response) => {
      toast.success(response.message || "Dynamic price created successfully");
      queryClient.invalidateQueries({ queryKey: ["court-dynamic-prices"] });
    },
    onError: (error: Error) => {
      console.error("Create court dynamic price error:", error);
      toast.error(
        error.message || "Failed to create dynamic price. Please try again."
      );
    },
  });
};

export const useUpdateCourtDynamicPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CourtDynamicPriceUpdateData;
    }) => dynamicPriceApi.update(id, data),
    onSuccess: (response) => {
      toast.success(response.message || "Dynamic price updated successfully");
      queryClient.invalidateQueries({ queryKey: ["court-dynamic-prices"] });
    },
    onError: (error: Error) => {
      console.error("Update court dynamic price error:", error);
      toast.error(
        error.message || "Failed to update dynamic price. Please try again."
      );
    },
  });
};

export const useDeleteCourtDynamicPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dynamicPriceApi.delete,
    onSuccess: (response) => {
      toast.success(response.message || "Dynamic price deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["court-dynamic-prices"] });
    },
    onError: (error: Error) => {
      console.error("Delete court dynamic price error:", error);
      toast.error(
        error.message || "Failed to delete dynamic price. Please try again."
      );
    },
  });
};
