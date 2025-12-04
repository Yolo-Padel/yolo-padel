"use client";

import { UserType } from "@/types/prisma";
import { DashboardHeader } from "./dashboard-header";
import { DashboardMetrics } from "./dashboard-metrics";
import { TodaysBookingSection } from "./todays-booking-section";
import { BookingTableSection } from "./booking-table-section";

interface DashboardContentProps {
  userType: UserType;
}

export function DashboardContent({ userType }: DashboardContentProps) {
  const isStaff = userType === "STAFF";

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader />

      <DashboardMetrics userType={userType} />

      {!isStaff ? <TodaysBookingSection /> : <BookingTableSection />}
    </div>
  );
}
