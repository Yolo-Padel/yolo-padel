import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Profile } from '@/types/prisma';
import { UserCreateData } from '@/lib/validations/user.validation';
import { toast } from 'sonner';

// Types for API responses
interface UsersResponse {
  success: boolean;
  data: {
    users: (User & { profile?: Profile | null })[];
  } | null;
  message: string;
  errors?: any[];
}

interface InviteUserResponse {
  success: boolean;
  data: {
    user: User;
    profile: Profile;
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

const inviteUserApi = {
  inviteUser: async (data: UserCreateData): Promise<InviteUserResponse> => {
    const response = await fetch("/api/users/invite-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to invite user");
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

export const useInviteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteUserApi.inviteUser,
    onSuccess: (data: InviteUserResponse) => {
      toast.success(data.message || "User invited successfully!");

      // Invalidate users query to refetch users
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error) => {
      console.error("Invite user error:", error);
      toast.error(error.message || "Failed to invite user. Please try again.");
    },
  });
};