import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  RegisterFormInput,
  LoginFormInput,
} from "@/lib/validations/auth.validation";

// Shared types
export type Role = "ADMIN" | "USER"

export type User = {
  id: string
  email: string
  role: Role
  isActive: boolean
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export type Profile = {
  id: string
  userId: string
  firstName: string | null
  lastName: string | null
  avatar: string | null
  createdAt: string
  updatedAt: string
}

// Types for API responses
interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    profile: Profile | null;
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

  updateProfile: async (data: { firstName: string; lastName: string }): Promise<AuthResponse> => {
    const response = await fetch("/api/profile/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Profile update failed");
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
      window.location.href = "/admin/auth";
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
  });
};

// Hook untuk update profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      // Show success message
      toast.success('Profile updated successfully!');
      
      // Invalidate user query to refetch current user
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: Error) => {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    },
  });
};

// Hook untuk cek apakah user sudah login
export const useAuth = () => {
  const { data, isLoading, error } = useCurrentUser();

  return {
    user: data?.data?.user || null,
    profile: data?.data?.profile || null,
    isLoading,
    isAuthenticated: !!data?.success && !!data?.data?.user,
    error,
  };
};
