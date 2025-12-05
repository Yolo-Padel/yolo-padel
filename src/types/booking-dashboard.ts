import type { BookingStatus } from "@/types/prisma";

export interface BookingSummaryStats {
  total: number;
  completed: number;
  pending: number;
  upcoming: number;
  cancelled: number;
  expiredPayment: number;
  comparison?: ComparisonData;
}

export interface ComparisonData {
  percentageChange: number;
  isPositive: boolean;
}

export interface BookingDashboardMetrics {
  totalRevenue: {
    amount: number;
    transactionCount: number;
    comparison?: ComparisonData;
  };
  totalBookings: {
    total: number;
    completed: number;
    upcoming: number;
    pending: number;
    cancelled: number;
    comparison?: ComparisonData;
  };
  paidRate: {
    percentage: number;
    paidCount: number;
    totalCount: number;
    comparison?: ComparisonData;
  };
  cancellation: {
    total: number;
    cancelled: number;
    expiredPayment: number;
    comparison?: ComparisonData;
  };
  courtUtilization?: {
    percentage: number;
    utilizedCourts: number;
    totalActiveCourts: number;
    comparison?: ComparisonData;
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
  venueName: string;
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
