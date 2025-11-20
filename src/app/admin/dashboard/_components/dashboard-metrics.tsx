"use client";

import { useMemo } from "react";
import { Role } from "@/types/prisma";
import { MetricCard } from "./metric-card";
import {
  DollarSign,
  CalendarDays,
  TrendingUp,
  CalendarX2,
  LandPlot,
} from "lucide-react";
import {
  useAdminBookingDashboard,
  useSuperAdminBookingDashboard,
} from "@/hooks/use-booking";
import { formatCurrency } from "@/lib/order-utils";
import type {
  AdminDashboardSnapshot,
  SuperAdminDashboardSnapshot,
} from "@/types/booking-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardMetricsProps {
  role: Role;
}

type MetricItem = {
  title: string;
  description: string;
  value: string;
  icon: typeof DollarSign;
  iconBg: string;
};

const CARD_ICON_BG = "bg-[#ecf1bb]";

const numberFormatter = new Intl.NumberFormat("id-ID");

function formatCount(value?: number | null) {
  if (value === undefined || value === null) return "-";
  return numberFormatter.format(value);
}

function formatPercentage(value?: number | null) {
  if (value === undefined || value === null) return "-";
  return `${Math.round(value)}%`;
}

function buildSuperAdminMetrics(
  snapshot?: SuperAdminDashboardSnapshot
): MetricItem[] {
  const metrics = snapshot?.metrics;
  const summary = snapshot?.bookingSummary;

  return [
    {
      title: "Total Revenue",
      description: `From ${
        metrics?.totalRevenue.transactionCount
          ? formatCount(metrics.totalRevenue.transactionCount)
          : "0"
      } total transactions`,
      value: formatCurrency(metrics?.totalRevenue.amount ?? 0),
      icon: DollarSign,
      iconBg: CARD_ICON_BG,
    },
    {
      title: "Total Bookings",
      description: summary
        ? `${formatCount(summary.completed)} completed • ${formatCount(
            summary.cancelled
          )} cancelled • ${formatCount(summary.upcoming)} upcoming`
        : "Completed • Cancelled • Upcoming",
      value: `${formatCount(summary?.total ?? 0)} Bookings`,
      icon: CalendarDays,
      iconBg: CARD_ICON_BG,
    },
    {
      title: "Paid Rate",
      description: "Successful payment completion",
      value: formatPercentage(metrics?.paidRate.percentage ?? 0),
      icon: TrendingUp,
      iconBg: CARD_ICON_BG,
    },
    {
      title: "Cancellation",
      description: summary
        ? `${formatCount(summary.cancelled)} cancelled • ${formatCount(
            summary.expiredPayment
          )} expired payment`
        : "No cancellation data",
      value: `${formatCount(metrics?.cancellation.total ?? 0)} Cases`,
      icon: CalendarX2,
      iconBg: CARD_ICON_BG,
    },
  ];
}

function buildAdminMetrics(snapshot?: AdminDashboardSnapshot): MetricItem[] {
  const metrics = snapshot?.metrics;
  const utilization = metrics?.courtUtilization;

  return [
    {
      title: "Total Revenue",
      description: metrics
        ? `${formatCount(metrics.totalBookings.completed)} completed transactions`
        : "Completed transactions",
      value: formatCurrency(metrics?.totalRevenue.amount ?? 0),
      icon: DollarSign,
      iconBg: CARD_ICON_BG,
    },
    {
      title: "Total Bookings",
      description: metrics
        ? `${formatCount(
            metrics.totalBookings.completed
          )} Completed • ${formatCount(
            metrics.totalBookings.ongoing
          )} Ongoing • ${formatCount(metrics.totalBookings.upcoming)} Upcoming`
        : "Completed • Ongoing • Upcoming",
      value: `${formatCount(metrics?.totalBookings.total ?? 0)} Bookings`,
      icon: CalendarDays,
      iconBg: CARD_ICON_BG,
    },
    {
      title: "Court Utilization",
      description: utilization
        ? `${formatCount(utilization.utilizedCourts)} of ${formatCount(
            utilization.totalActiveCourts
          )} active courts`
        : "Based on total active courts",
      value: utilization ? formatPercentage(utilization.percentage) : "-",
      icon: LandPlot,
      iconBg: CARD_ICON_BG,
    },
    {
      title: "Cancellation",
      description: metrics
        ? `${formatCount(metrics.cancellation.cancelled)} cancelled • ${formatCount(
            metrics.cancellation.expiredPayment
          )} expired payment`
        : "No cancellation data",
      value: `${formatCount(metrics?.cancellation.total ?? 0)} Cases`,
      icon: CalendarX2,
      iconBg: CARD_ICON_BG,
    },
  ];
}

function MetricSkeletonRow() {
  return (
    <div className="flex gap-2 items-start w-full">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={`metric-skeleton-${idx}`}
          className="flex flex-col gap-3 rounded-xl border border-border/60 p-4 w-full"
        >
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      ))}
    </div>
  );
}

export function DashboardMetrics({ role }: DashboardMetricsProps) {
  const isSuperAdmin = role === "SUPER_ADMIN";

  const {
    data: superAdminData,
    isLoading: isSuperAdminLoading,
    error: superAdminError,
  } = useSuperAdminBookingDashboard({ enabled: isSuperAdmin });

  const {
    data: adminData,
    isLoading: isAdminLoading,
    error: adminError,
  } = useAdminBookingDashboard({ enabled: !isSuperAdmin });

  const snapshot:
    | SuperAdminDashboardSnapshot
    | AdminDashboardSnapshot
    | undefined =
    (isSuperAdmin ? superAdminData?.data : adminData?.data) ?? undefined;

  const metrics = useMemo(() => {
    return isSuperAdmin
      ? buildSuperAdminMetrics(
          snapshot as SuperAdminDashboardSnapshot | undefined
        )
      : buildAdminMetrics(snapshot as AdminDashboardSnapshot | undefined);
  }, [snapshot, isSuperAdmin]);

  const isLoading = isSuperAdmin ? isSuperAdminLoading : isAdminLoading;
  const error = (isSuperAdmin ? superAdminError : adminError) as Error | null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 items-start max-w-[1280px] w-full">
        {isLoading && !snapshot ? (
          <MetricSkeletonRow />
        ) : (
          <div className="flex gap-2 items-start w-full">
            {metrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>
        )}
        {error && !snapshot && (
          <p className="text-sm text-destructive">
            Gagal memuat metrik dashboard: {error.message}
          </p>
        )}
      </div>
    </div>
  );
}
