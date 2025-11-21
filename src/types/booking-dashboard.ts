import type { BookingStatus } from "@/types/prisma";

export interface BookingSummaryStats {
  total: number;
  completed: number;
  pending: number;
  upcoming: number;
  cancelled: number;
  expiredPayment: number;
}

export interface BookingDashboardMetrics {
  totalRevenue: {
    amount: number;
    transactionCount: number;
  };
  totalBookings: {
    total: number;
    completed: number;
    upcoming: number;
    pending: number;
    cancelled: number;
  };
  paidRate: {
    percentage: number;
    paidCount: number;
    totalCount: number;
  };
  cancellation: {
    total: number;
    cancelled: number;
    expiredPayment: number;
  };
  courtUtilization?: {
    percentage: number;
    utilizedCourts: number;
    totalActiveCourts: number;
  };
}

export interface TodaysBookingCard {
  id: string;
  bookingCode: string;
  bookingDate: Date;
  totalPrice: number;
  duration: number;
  status: BookingStatus;
  timeSlots: Array<{ openHour: string; closeHour: string }>;
  customerName: string;
  courtName: string;
}

export interface TodaysBookingCollection {
  total: number;
  items: TodaysBookingCard[];
}

export interface SuperAdminDashboardSnapshot {
  metrics: BookingDashboardMetrics;
  bookingSummary: BookingSummaryStats;
}

export interface AdminDashboardSnapshot {
  metrics: BookingDashboardMetrics;
  todaysBookings: TodaysBookingCollection;
}
