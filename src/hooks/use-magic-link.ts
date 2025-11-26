import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { MagicLinkVerifyInput } from "@/lib/validations/magic-link.validation";
import { toast } from "sonner";
import { LoginWithMagicLinkData } from "@/lib/validations/auth.validation";
import { UserType } from "@/types/prisma";

// Types for API Response
export type VerifyMagicLinkResult = {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      userType: string;
      isActive: boolean;
      isEmailVerified: boolean;
      profile: {
        id: string;
        userId: string;
        fullName: string;
        phoneNumber: string;
        address: string;
      };
      membership: {
        id: string;
        userId: string;
        membershipType: string;
        startDate: Date;
        endDate: Date;
      };
      nextBooking: {
        id: string;
        bookingDate: Date;
        timeSlots: {
          id: string;
          openHour: string;
          closeHour: string;
        }[];
      };
    };
  };
};

// Api functions
const magicLinkApi = {
  verify: async (
    input: MagicLinkVerifyInput
  ): Promise<VerifyMagicLinkResult> => {
    const response = await fetch("/api/auth/magic-link/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      credentials: "include", // For cookies
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Magic link verification failed");
    }

    return response.json();
  },
  request: async (input: LoginWithMagicLinkData) => {
    const response = await fetch("/api/auth/magic-link/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Magic link request failed");
    }
    return response.json();
  },
};

// Custom hooks
export const useMagicLinkVerify = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: MagicLinkVerifyInput) => {
      return magicLinkApi.verify(input);
    },
    onSuccess: (data: VerifyMagicLinkResult) => {
      // Show success message
      toast.success(data.message || "Magic link verification successful");

      // Update user data in query cache
      queryClient.setQueryData(["currentUser"], {
        success: data.success,
        data: data.data,
        message: data.message,
      });

      // Invalidate user query to refresh data
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      // Redirect based on user type from the response data
      if (data.data.user.userType === UserType.USER) {
        router.push("/dashboard/booking");
      } else {
        router.push("/admin/dashboard");
      }
    },
    onError: (error: Error) => {
      console.error("Magic link verification error:", error);
      toast.error(error.message || "Magic link verification failed");
    },
  });
};

export const useMagicLinkRequest = () => {
  return useMutation({
    mutationFn: (input: LoginWithMagicLinkData) => {
      return magicLinkApi.request(input);
    },
    onSuccess: (data: any) => {
      toast.success(data.message || "Magic link request successful");
    },
    onError: (error: Error) => {
      console.error("Magic link request error:", error);
      toast.error(error.message || "Magic link request failed");
    },
  });
};
