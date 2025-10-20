import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ProfileUpdateData } from '@/lib/validations/auth.validation';
import { User, Profile } from './use-auth';

// Types for API responses
interface ProfileResponse {
  success: boolean;
  data: {
    user: User;
    profile: Profile | null;
  } | null;
  message: string;
  errors?: any[];
}

// API functions
const profileApi = {
  updateProfile: async (data: ProfileUpdateData): Promise<ProfileResponse> => {
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
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateProfile,
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
