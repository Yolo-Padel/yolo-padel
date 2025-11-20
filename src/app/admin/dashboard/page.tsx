"use client";

import { DashboardContent } from "./_components/dashboard-content";
import { useAuth } from "@/hooks/use-auth";
import { Role } from "@/types/prisma";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const userRole = (user?.role as Role) || Role.ADMIN;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <DashboardContent role={userRole} />;
}
