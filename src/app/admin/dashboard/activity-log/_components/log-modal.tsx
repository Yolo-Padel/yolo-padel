"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EntityType } from "@/types/entity";
import { ActionType } from "@/types/action";
import { JsonValue } from "@prisma/client/runtime/library";
import { stringUtils } from "@/lib/format/string";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type LogDetailsProps = {
  date: Date;
  performedBy: string;
  role: string;
  module: EntityType;
  action: ActionType;
  reference: string;
  description: string | null;
  changes?: JsonValue;
};

type ChangePayload = {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return "-";
  }
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "-";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
};

const extractChanges = (payload?: ChangePayload) => {
  if (!payload || !isRecord(payload)) {
    return [];
  }

  const before = isRecord(payload.before) ? payload.before : {};
  const after = isRecord(payload.after) ? payload.after : {};
  const fields = Array.from(
    new Set([...Object.keys(before), ...Object.keys(after)])
  );

  return fields
    .map((key) => {
      const prev = before[key];
      const next = after[key];
      const unchanged = JSON.stringify(prev) === JSON.stringify(next);

      if (unchanged) {
        return null;
      }

      return { key, before: prev, after: next };
    })
    .filter(
      (entry): entry is { key: string; before: unknown; after: unknown } =>
        entry !== null
    );
};

const formatFieldLabel = (key: string) =>
  stringUtils.toTitleCase(key.replace(/[_-]+/g, " "));

export function LogDetails({
  open,
  onOpenChange,
  logDetailsProps,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logDetailsProps: LogDetailsProps | null;
}) {
  const changes = extractChanges(
    logDetailsProps?.changes as ChangePayload | undefined
  );

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      key={logDetailsProps?.reference}
    >
      <DialogContent className="max-h-[90vh] flex flex-col overflow-hidden sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <div className="flex justify-between">
            <div className="flex flex-col">
              <DialogTitle className="text-2xl">Activity Details</DialogTitle>
              <DialogDescription>
                Recorded activity for {logDetailsProps?.module} change by{" "}
                {logDetailsProps?.performedBy}
              </DialogDescription>
            </div>
             <Button
              onClick={() => onOpenChange(false)}
              className="relative shrink-0 size-8 cursor-pointer h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
              aria-label="Close profile modal"
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Activity Overview */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Activity Overview</h4>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
              <span className="text-muted-foreground">Date & Time</span>
              <span className="truncate">
                {logDetailsProps?.date?.toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              <span className="text-muted-foreground">Performed By</span>
              <span className="truncate">{logDetailsProps?.performedBy}</span>

              <span className="text-muted-foreground">Role</span>
              <span className="truncate">
                {stringUtils.toTitleCase(logDetailsProps?.role ?? "")}
              </span>

              <span className="text-muted-foreground">Action</span>
              <span className="truncate">
                {stringUtils.toTitleCase(
                  logDetailsProps?.action?.split("_")[0] ?? ""
                )}
              </span>

              <span className="text-muted-foreground">Reference</span>
              <span className="truncate">{logDetailsProps?.reference}</span>
            </div>
          </div>

          {/* Log Description */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Log Description</h4>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm break-words">
                {logDetailsProps?.description ?? "-"}
              </p>
            </div>
          </div>

          {/* Affected Data */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Affected Data</h4>
            {!changes.length ? (
              <div className="rounded-lg border bg-muted/30 p-4">
                <span className="text-sm text-muted-foreground">
                  No data changed for this activity.
                </span>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <div className="grid grid-cols-3 bg-muted p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Property</span>
                  <span>Before</span>
                  <span>After</span>
                </div>
                <div className="divide-y">
                  {changes.map(({ key, before, after }) => (
                    <div
                      key={key}
                      className="grid grid-cols-3 gap-2 p-3 text-sm"
                    >
                      <span className="text-muted-foreground truncate">
                        {formatFieldLabel(key)}
                      </span>
                      <span className="break-words min-w-0">
                        {formatValue(before)}
                      </span>
                      <span className="break-words min-w-0">
                        {formatValue(after)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
