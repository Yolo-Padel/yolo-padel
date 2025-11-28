import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, Profile, UserType } from "@/types/prisma";
import { NextBookingInfo } from "@/types/profile";
import { useRouter } from "next/navigation";

interface BypassAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    profile: Profile;
    nextBooking: NextBookingInfo;
  };
}

const authApi = {
  bypassAuth: async (userEmail: string): Promise<BypassAuthResponse> => {
    const response = await fetch("/api/auth/bypass", {
      method: "POST",
      body: JSON.stringify({ userEmail }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Bypass failed");
    }
    return response.json();
  },
};

export const useBypassAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.bypassAuth,
    onSuccess: (data: BypassAuthResponse) => {
      toast.success(data.message || "Bypass successful");

      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      if (data.data.user.userType === UserType.USER) {
        router.push("/dashboard/booking");
      } else {
        router.push("/admin/dashboard");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Bypass failed");
    },
  });
};
