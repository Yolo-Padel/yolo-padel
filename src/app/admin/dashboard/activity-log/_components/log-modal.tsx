"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { EntityType } from "@/types/entity";
import { ActionType } from "@/types/action";
import { Button } from "@/components/ui/button";
import { JsonValue } from "@prisma/client/runtime/library";
import { stringUtils } from "@/lib/format/string";

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
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      key={logDetailsProps?.reference}
    >
      <DialogContent showCloseButton={false} className="p-6">
        <header className="flex flex-col gap-2">
          <DialogTitle className="text-2xl font-semibold">
            Activity Details
          </DialogTitle>
          <span className="text-muted-foreground text-sm">
            Recorded activity for {logDetailsProps?.module} change by{" "}
            {logDetailsProps?.performedBy}
          </span>
          <Button
            className="absolute top-6 right-6 cursor-pointer bg-primary rounded-full p-0"
            onClick={() => onOpenChange(false)}
          >
            <X className="text-black size-4" />
          </Button>
        </header>

        <section className="flex flex-col gap-3">
          <span className="text-foreground font-semibold text-base">
            Activity Overview
          </span>
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-muted bg-background p-4 text-sm">
            <div className="flex flex-col gap-2 text-muted-foreground">
              <span>Date & Time</span>
              <span>Performed By</span>
              <span>Role</span>
              <span>Action</span>
              <span>Reference</span>
            </div>
            <div className="flex flex-col gap-2 text-foreground">
              <span>
                {logDetailsProps?.date?.toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span>{logDetailsProps?.performedBy}</span>
              <span>
                {stringUtils.toTitleCase(logDetailsProps?.role ?? "")}
              </span>
              <span>
                {stringUtils.toTitleCase(
                  logDetailsProps?.action?.split("_")[0] ?? ""
                )}
              </span>
              <span>{logDetailsProps?.reference}</span>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <span className="text-foreground font-semibold text-base">
            Log Description
          </span>
          <div className="rounded-lg border border-muted bg-background">
            <p className="p-4 text-sm text-foreground">
              {logDetailsProps?.description ?? "-"}
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <span className="text-foreground font-semibold text-base">
            Affected Data
          </span>
          {(() => {
            const changes = extractChanges(
              logDetailsProps?.changes as ChangePayload | undefined
            );

            if (!changes.length) {
              return (
                <div className="rounded-lg border border-muted bg-background p-4">
                  <span className="text-sm text-muted-foreground">
                    No data changed for this activity.
                  </span>
                </div>
              );
            }

            return (
              <div className="overflow-hidden rounded-lg border border-muted bg-background">
                <div className="grid grid-cols-3 bg-muted p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Property</span>
                  <span>Before</span>
                  <span>After</span>
                </div>
                <div className="divide-y divide-muted/60">
                  {changes.map(({ key, before, after }) => (
                    <div
                      key={key}
                      className="grid grid-cols-3 items-start gap-3 p-4 text-sm"
                    >
                      <span className="capitalize text-muted-foreground">
                        {formatFieldLabel(key)}
                      </span>
                      <span className="break-words text-foreground">
                        {formatValue(before)}
                      </span>
                      <span className="break-words text-foreground">
                        {formatValue(after)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </section>
      </DialogContent>
    </Dialog>
  );
}
