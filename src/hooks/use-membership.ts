import { Membership } from "@/types/prisma";
import { useQuery } from "@tanstack/react-query";

// Types for API responses
interface MembershipResponse {
  success: boolean;
  data: Membership[];
  message: string;
  errors?: any[];
}
const membershipApi = {
  getMemberships: async (): Promise<MembershipResponse> => {
    const response = await fetch("/api/membership");
    const data = await response.json();
    return data;
  },
};

export const useMemberships = () => {
  return useQuery({
    queryKey: ["memberships"],
    queryFn: membershipApi.getMemberships,
  });
};
