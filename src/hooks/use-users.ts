import { useQuery } from '@tanstack/react-query';
import { User, Profile } from './use-auth';

export type UserRow = User & { profile?: Profile | null }

// Types for API responses
interface UsersResponse {
  success: boolean;
  data: {
    users: UserRow[];
  } | null;
  message: string;
  errors?: any[];
}

// API functions
const usersApi = {
  getUsers: async (): Promise<UsersResponse> => {
    const response = await fetch("/api/users", {
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch users");
    }

    return response.json();
  },
};

// Custom hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.getUsers(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
