import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Profile } from '@/types/prisma';
import { UserCreateData, UserDeleteData, UserUpdateData, UserResendInviteData } from '@/lib/validations/user.validation';
import { toast } from 'sonner';

// Types for API responses
interface UsersResponse {
  success: boolean;
  data: {
    users: (User & { profile?: Profile | null } & { invitation?: { state: 'valid' | 'expired' | 'used' | 'none'; expiresAt?: string } })[];
  } | null;
  message: string;
  errors?: any[];
}

interface DeleteUserResponse {
  success: boolean;
  message: string;
  errors?: any[];
}

interface UpdateUserResponse {
  success: boolean;
  data: { user: User; profile?: Profile | null } | null;
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

interface ResendInviteResponse {
  success: boolean;
  message: string;
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
  deleteUser: async (data: UserDeleteData): Promise<DeleteUserResponse> => {
    const response = await fetch("/api/users", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Failed to delete user",
      };
    }

    return {
      success: true,
      message: "User deleted successfully",
    };
  },
  updateUser: async (data: UserUpdateData): Promise<UpdateUserResponse> => {
    const response = await fetch("/api/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        data: null,
        message: result.message || "Failed to update user",
      };
    }

    return {
      success: true,
      data: result.data || null,
      message: result.message || "User updated successfully",
    };
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
    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        data: null,
        message: result.message || "Failed to invite user",
      };  
    }

    return {
      success: true,
      data: result.data,
      message: result.message || "User invited successfully!",
    };
  },
  resendInvitation: async (data: UserResendInviteData): Promise<ResendInviteResponse> => {
    const response = await fetch("/api/users/invite-user/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, message: result.message || "Failed to resend invitation" };
    }
    return { success: true, message: result.message || "Invitation resent successfully" };
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
      if (data.success) {
        toast.success(data.message || "User invited successfully!");
      } else {
        toast.error(data.message || "Failed to invite user. Please try again.");
      }

      // Invalidate users query to refetch users
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error) => {
      console.error("Invite user error:", error);
      toast.error(error.message || "Failed to invite user. Please try again.");
    },
  });
};

export const useResendInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inviteUserApi.resendInvitation,
    onSuccess: (data: ResendInviteResponse) => {
      if (data.success) {
        toast.success(data.message || "Invitation resent successfully!");
      } else {
        toast.error(data.message || "Failed to resend invitation.");
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error) => {
      console.error("Resend invitation error:", error);
      toast.error(error.message || "Failed to resend invitation.");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: (result: DeleteUserResponse) => {
      if (result.success) {
        toast.success(result.message || "User deleted successfully!");
      } else {
        toast.error(result.message || "Failed to delete user. Please try again.");
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error) => {
      console.error("Delete user error:", error);
      toast.error(error.message || "Failed to delete user. Please try again.");
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.updateUser,
    onSuccess: (result: UpdateUserResponse) => {
      if (result.success) {
        toast.success(result.message || "User updated successfully!");
      } else {
        toast.error(result.message || "Failed to update user. Please try again.");
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error) => {
      console.error("Update user error:", error);
      toast.error(error.message || "Failed to update user. Please try again.");
    },
  });
};