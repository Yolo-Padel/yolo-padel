import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Profile,
  Membership,
  UserType,
  UserStatus,
} from "@/types/prisma";
import {
  UserCreateData,
  UserDeleteData,
  UserUpdateData,
  UserResendInviteData,
} from "@/lib/validations/user.validation";
import { toast } from "sonner";

// Types for API responses
interface UsersResponse {
  success: boolean;
  data: {
    users: (User & { profile?: Profile | null } & {
      membership?: Membership | null;
    } & {
      invitation?: {
        state: "valid" | "expired" | "used" | "none";
        expiresAt?: string;
      };
    })[];
  } | null;
  message: string;
  errors?: any[];
}

// Types for admin users with filtering
export interface UseAdminUsersOptions {
  search?: string;
  userType?: string;
  status?: string;
  venue?: string;
  page?: number;
  limit?: number;
}

interface AdminUsersResponse {
  success: boolean;
  message: string;
  data: (User & {
    profile?: Profile | null;
    membership?: Membership | null;
    invitation?: {
      state: "valid" | "expired" | "used" | "none";
      expiresAt?: string;
    };
  })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
  resendInvitation: async (
    data: UserResendInviteData
  ): Promise<ResendInviteResponse> => {
    const response = await fetch("/api/users/invite-user/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const result = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Failed to resend invitation",
      };
    }
    return {
      success: true,
      message: result.message || "Invitation resent successfully",
    };
  },
};

// API function for admin users with filtering
const getAdminUsersApi = async (
  options: UseAdminUsersOptions = {}
): Promise<AdminUsersResponse> => {
  // Build query string from filter options
  const searchParams = new URLSearchParams();

  // Only add defined values to query string
  if (options.search) searchParams.append("search", options.search);
  if (options.userType) searchParams.append("userType", options.userType);
  if (options.status) searchParams.append("status", options.status);
  if (options.venue) searchParams.append("venue", options.venue);
  if (options.page) searchParams.append("page", options.page.toString());
  if (options.limit) searchParams.append("limit", options.limit.toString());

  const queryString = searchParams.toString();
  const url = queryString ? `/api/users?${queryString}` : "/api/users";

  const response = await fetch(url, {
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch users");
  }

  return response.json();
};

// Custom hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.getUsers(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to get all users for admin dashboard with filtering support
 *
 * Accepts filter options as parameters:
 * - search: Search by name or email
 * - userType: Filter by user type (ADMIN, STAFF, USER)
 * - status: Filter by status (ACTIVE, INACTIVE, INVITED)
 * - venue: Filter by assigned venue ID
 * - page: Current page number (default: 1)
 * - limit: Results per page (default: 10, max: 100)
 *
 * Returns:
 * - data: Array of users with pagination metadata
 * - isLoading: Initial loading state
 * - isFetching: Refetching state (for filter changes)
 * - error: Error object if request fails
 *
 * React Query configuration:
 * - staleTime: 30 seconds (cache results for 30s)
 * - queryKey includes filter options for proper cache invalidation
 *
 * Requirements: 7.1, 8.5
 */
export const useAdminUsers = (options: UseAdminUsersOptions = {}) => {
  // Include filter options in query key for proper caching
  // This ensures different filter combinations are cached separately
  return useQuery({
    queryKey: ["admin-users", options],
    queryFn: () => getAdminUsersApi(options),
    staleTime: 30000, // 30 seconds - cache for performance (Requirement 8.5)
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

      // Invalidate users queries to refetch users
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
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
        toast.error(
          result.message || "Failed to delete user. Please try again."
        );
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
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
        toast.error(
          result.message || "Failed to update user. Please try again."
        );
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => {
      console.error("Update user error:", error);
      toast.error(error.message || "Failed to update user. Please try again.");
    },
  });
};
