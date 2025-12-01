import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  RegisterFormInput,
  LoginFormInput,
} from "@/lib/validations/auth.validation";

import { User, Profile, Membership, Venue, Roles } from "@/types/prisma";
import { NextBookingInfo } from "@/types/profile";

// Types for API responses
interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    profile: Profile | null;
    nextBooking?: NextBookingInfo | null;
    membership?: Membership | null;
    venues?: Venue[] | null;
    roles?: Roles | null;
  } | null;
  message: string;
  errors?: any[];
}

// API functions
const authApi = {
  register: async (data: RegisterFormInput): Promise<AuthResponse> => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include", // For cookies
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Registration failed");
    }

    return response.json();
  },

  login: async (data: LoginFormInput): Promise<AuthResponse> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include", // Important for cookies
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    return response.json();
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    return response.json();
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Not authenticated");
    }

    return response.json();
  },

  createGuestUser: async (data: {
    email: string;
    fullName: string;
  }): Promise<AuthResponse> => {
    const response = await fetch("/api/auth/guest/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include", // Important for cookies
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create guest user");
    }

    return response.json();
  },
};

// Custom hooks
export const useRegister = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Show success message
      toast.success("Account created successfully! Welcome!");

      // Invalidate user query to refetch current user
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      // Redirect to dashboard
      router.push("/admin/dashboard");
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      toast.error(
        error.message || "Failed to create account. Please try again."
      );
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Show success message
      toast.success("Login successful! Welcome back!");

      // Invalidate user query to refetch current user
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      // Redirect to dashboard
      router.push("/admin/dashboard");
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login. Please try again.");
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all queries and redirect
      queryClient.clear();
      window.location.href = "/auth";
    },
  });
};

// Hook untuk mendapatkan current user dengan React Query
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

// Hook untuk cek apakah user sudah login
export const useAuth = () => {
  const { data, isLoading, error } = useCurrentUser();

  return {
    user: data?.data?.user || null,
    profile: data?.data?.profile || null,
    nextBooking: data?.data?.nextBooking || null,
    membership: data?.data?.membership || null,
    venues: data?.data?.venues || null,
    roles: data?.data?.roles || null,
    isLoading,
    isAuthenticated: !!data?.success && !!data?.data?.user,
    error,
  };
};

/**
 * Hook untuk create guest user (auto-login setelah create)
 */
export const useCreateGuestUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.createGuestUser,
    onSuccess: async (data) => {
      // Invalidate and refetch user query to update auth state (auto-login)
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      await queryClient.refetchQueries({ queryKey: ["currentUser"] });
    },
    onError: (error: Error) => {
      console.error("Create guest user error:", error);
      // Error toast will be handled by caller
    },
  });
};
