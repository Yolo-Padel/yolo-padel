import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { MagicLinkVerifyInput } from "@/lib/validations/magic-link.validation";
import { toast } from "sonner";

// Types for API Response
export type VerifyMagicLinkResult = {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    isActive: boolean;
    isEmailVerified: boolean;
    profile: {
      id: string;
      userId: string;
      fullName: string;
      phoneNumber: string;
      address: string;
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
        data: { user: data.user },
      });

      // Invalidate user query to refresh data
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      // Redirect based on user role from the response data
      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error: Error) => {
      console.error("Magic link verification error:", error);
      toast.error(error.message || "Magic link verification failed");
    },
  });
};
