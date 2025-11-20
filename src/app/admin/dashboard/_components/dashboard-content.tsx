"use client";

import { Role } from "@/types/prisma";
import { DashboardHeader } from "./dashboard-header";
import { DashboardMetrics } from "./dashboard-metrics";
import { TodaysBookingSection } from "./todays-booking-section";
import { BookingTableSection } from "./booking-table-section";

interface DashboardContentProps {
  role: Role;
}

export function DashboardContent({ role }: DashboardContentProps) {
  const isSuperAdmin = role === "SUPER_ADMIN";

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader />

      <DashboardMetrics role={role} />

      {isSuperAdmin ? <BookingTableSection /> : <TodaysBookingSection />}
    </div>
  );
}
