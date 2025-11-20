import { useMutation, useQueryClient, useQuery} from "@tanstack/react-query";
import { ActivityLog, User, Profile } from "@/types/prisma";
import { ActionType } from "@/types/action";
import { EntityType } from "@/types/entity";
import { Role } from "@/types/prisma";
import { ServiceContext } from "@/types/service-context";

// Types for API Response
interface ActivityLogAdmin {
    success: boolean;
    message: string;
    errors?: any[];
    data: (ActivityLog & { user: User & { profile: Profile } })[]
}

// API Function
const activityLogsApi = {
    getActivityLogs: async (): Promise<ActivityLogAdmin> => {
        const response = await fetch("/api/activity-log", {
            credentials: "include",
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch activity logs");
        }

        return response.json();
    },
}

export const useActivityLogsAdmin = () => {
  return useQuery({
    queryKey: ["activityLogs"],
    queryFn: () => activityLogsApi.getActivityLogs(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};