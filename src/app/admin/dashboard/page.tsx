"use client";

import { DashboardContent } from "./_components/dashboard-content";
import { useAuth } from "@/hooks/use-auth";
import { UserType } from "@/types/prisma";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const userType = (user?.userType as UserType) || UserType.STAFF;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <DashboardContent userType={userType} />;
}
