"use client";

import { Button } from "@/components/ui/button";
import { Building2, Calendar, Settings } from "lucide-react";
import Image from "next/image";

export type TimetableEmptyStateType =
  | "no-venues"
  | "no-courts"
  | "no-bookings"
  | "no-prices";

type TimetableEmptyStateProps = {
  type: TimetableEmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  showIllustration?: boolean;
};

const defaultConfig: Record<
  TimetableEmptyStateType,
  {
    title: string;
    description: string;
    icon: React.ReactNode;
    illustration?: string;
  }
> = {
  "no-venues": {
    title: "No Venues Yet",
    description:
      "You haven't created any venues in the system yet. Start by creating your first venue to manage booking schedules and price configurations.",
    icon: <Building2 className="w-12 h-12 text-muted-foreground" />,
    illustration: "/booking-court-illustration.svg",
  },
  "no-courts": {
    title: "No Courts Yet",
    description:
      "The selected venue doesn't have any courts yet. Add courts first to start managing booking schedules and price configurations.",
    icon: <Calendar className="w-12 h-12 text-muted-foreground" />,
    illustration: "/booking-court-illustration.svg",
  },
  "no-bookings": {
    title: "No Bookings Yet",
    description:
      "There are no bookings for the selected date. Bookings will appear here once someone makes a reservation.",
    icon: <Calendar className="w-12 h-12 text-muted-foreground" />,
    illustration: "/booking-court-illustration.svg",
  },
  "no-prices": {
    title: "No Custom Prices Yet",
    description:
      "No custom prices have been configured yet. Add custom prices to set special rates for specific time periods.",
    icon: <Settings className="w-12 h-12 text-muted-foreground" />,
    illustration: "/booking-court-illustration.svg",
  },
};

export function TimetableEmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
  showIllustration = true,
}: TimetableEmptyStateProps) {
  const config = defaultConfig[type];
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border rounded-lg bg-background">
      {/* Illustration */}
      {showIllustration && config.illustration && (
        <div className="w-64 h-64 flex items-center justify-center mb-6">
          <Image
            src={config.illustration}
            alt={finalTitle}
            width={256}
            height={256}
            className="object-contain"
          />
        </div>
      )}

      {/* Icon fallback if no illustration */}
      {(!showIllustration || !config.illustration) && (
        <div className="mb-6 flex items-center justify-center">
          {config.icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-semibold mb-2 text-foreground">
        {finalTitle}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground text-center mb-6 max-w-md font-light">
        {finalDescription}
      </p>

      {/* Action Button */}
      {onAction && actionLabel && (
        <Button
          className="bg-primary hover:bg-primary/90 mx-auto px-6 py-2"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
