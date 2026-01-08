"use client";

import { LucideIcon, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ComparisonData {
  percentageChange: number;
  isPositive: boolean;
}

interface MetricCardProps {
  title: string;
  description: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  comparison?: ComparisonData;
}

export function MetricCard({
  title,
  description,
  value,
  icon: Icon,
  iconBg,
  comparison,
}: MetricCardProps) {
  const hasComparison = comparison !== undefined;
  const isPositive = comparison?.isPositive ?? false;
  const percentageChange = comparison?.percentageChange ?? 0;

  return (
    <Card className="flex-1 border-[1.5px] border-brand/40 rounded-xl p-5">
      <CardContent className="flex flex-col gap-3 p-0">
        <div
          className={cn(
            "rounded-xl size-12 flex items-center justify-center",
            iconBg,
          )}
        >
          <Icon className="size-6 text-brand" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-medium text-foreground">{title}</h3>
            <p className="text-xs font-normal text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="flex gap-4 items-end">
            <p className="flex-1 text-xl font-semibold text-foreground whitespace-pre-wrap">
              {value}
            </p>
          </div>
        </div>
        {hasComparison && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-md font-medium",
              isPositive ? "text-[#079455]" : "text-[#D92D20]",
            )}
          >
            {isPositive ? (
              <ArrowUp className="size-3" />
            ) : (
              <ArrowDown className="size-3" />
            )}
            <span>
              {Math.abs(percentageChange).toFixed(1)}%{" "}
              <span className="text-sm font-normal text-muted-foreground">
                vs last month
              </span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
