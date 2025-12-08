"use client";

import { UserType } from "@/types/prisma";
import { DashboardHeader } from "./dashboard-header";
import { DashboardMetrics } from "./dashboard-metrics";
import { TodaysBookingSection } from "./todays-booking-section";
import { BookingTableSection } from "./booking-table-section";
import { BookingDetailsModal } from "@/app/admin/dashboard/booking/_components/booking-details-modal";
import { BookingWithRelations } from "../booking/_components/booking-table";
import { useState } from "react";

interface DashboardContentProps {
  userType: UserType;
}

export function DashboardContent({ userType }: DashboardContentProps) {
  const isStaff = userType === "STAFF";
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] =
    useState<BookingWithRelations | null>(null);

  const handleViewBooking = (booking: BookingWithRelations) => {
    setSelectedDetail(booking);
    setDetailOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader />

      <DashboardMetrics userType={userType} />

      {isStaff ? (
        <TodaysBookingSection onViewBooking={handleViewBooking} />
      ) : (
        <BookingTableSection onViewBooking={handleViewBooking} />
      )}

      <BookingDetailsModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        booking={selectedDetail}
      />
    </div>
  );
}
