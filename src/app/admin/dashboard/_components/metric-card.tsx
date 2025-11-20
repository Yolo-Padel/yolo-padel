"use client";

import { LucideIcon, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  description: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
}

export function MetricCard({
  title,
  description,
  value,
  icon: Icon,
  iconBg,
}: MetricCardProps) {
  return (
    <Card className="flex-1 border-[1.5px] border-border/50 rounded-xl p-5">
      <CardContent className="flex flex-col gap-4 p-0">
        <div
          className={cn(
            "rounded-xl size-12 flex items-center justify-center",
            iconBg
          )}
        >
          <Icon className="size-6 text-[#8a9519]" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-medium text-foreground">{title}</h3>
            <p className="text-xs font-normal text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="flex gap-4 items-end">
            <p className="flex-1 text-2xl font-semibold text-foreground whitespace-pre-wrap">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
