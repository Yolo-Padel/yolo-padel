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
  /** Human-readable entity reference (e.g., venue name, user email) */
  entityReference: string | null;
  /** Technical entity ID (fallback if entityReference is not available) */
  entityId: string | null;
  description: string | null;
  changes?: JsonValue;
};

type ChangePayload = {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Check if a value looks like a permission object
 */
const isPermissionObject = (value: unknown): value is { module?: string; permission?: string; allowed?: boolean; moduleId?: string; permissionId?: string } => {
  if (!isRecord(value)) return false;
  return ('module' in value || 'moduleId' in value) && ('permission' in value || 'permissionId' in value);
};

/**
 * Format a permission object to human-readable string
 */
const formatPermission = (perm: { module?: string; permission?: string; allowed?: boolean; moduleId?: string; permissionId?: string }): string => {
  const moduleName = perm.module || perm.moduleId || "Unknown Module";
  const permissionName = perm.permission || perm.permissionId || "Unknown Permission";
  const status = perm.allowed !== undefined ? (perm.allowed ? "enabled" : "disabled") : "";
  
  if (status) {
    return `${moduleName}: ${permissionName} (${status})`;
  }
  return `${moduleName}: ${permissionName}`;
};

/**
 * Format an array of permissions to a readable list
 */
const formatPermissionArray = (permissions: unknown[]): string => {
  if (permissions.length === 0) return "-";
  
  // Check if all items are permission objects
  const allPermissions = permissions.every(isPermissionObject);
  
  if (allPermissions) {
    // Group by module for cleaner display
    const byModule = new Map<string, string[]>();
    
    for (const perm of permissions as Array<{ module?: string; permission?: string; allowed?: boolean; moduleId?: string; permissionId?: string }>) {
      const moduleName = perm.module || perm.moduleId || "Unknown";
      const permName = perm.permission || perm.permissionId || "Unknown";
      const status = perm.allowed !== undefined ? (perm.allowed ? "✓" : "✗") : "";
      const displayPerm = status ? `${permName} ${status}` : permName;
      
      if (!byModule.has(moduleName)) {
        byModule.set(moduleName, []);
      }
      byModule.get(moduleName)!.push(displayPerm);
    }
    
    // Format as "Module: perm1, perm2; Module2: perm3"
    const parts: string[] = [];
    for (const [module, perms] of byModule) {
      parts.push(`${module}: ${perms.join(", ")}`);
    }
    
    return parts.join("; ");
  }
  
  // Fall back to default array formatting
  return permissions.map(item => formatValue(item)).join(", ");
};

/**
 * Format a date value to human-readable string
 */
const formatDate = (value: unknown): string | null => {
  if (typeof value === "string") {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return null;
};

/**
 * Format any value to a human-readable string
 * Enhanced to handle complex objects, permission changes, and arrays better
 */
const formatValue = (value: unknown): string => {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return "-";
  }
  
  // Handle boolean values
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  
  // Handle string values
  if (typeof value === "string") {
    if (value.length === 0) return "-";
    
    // Check if it's a date string
    const dateFormatted = formatDate(value);
    if (dateFormatted) return dateFormatted;
    
    return value;
  }
  
  // Handle number values
  if (typeof value === "number") {
    return String(value);
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) return "-";
    
    // Check if it's an array of permissions
    if (value.some(isPermissionObject)) {
      return formatPermissionArray(value);
    }
    
    // For short arrays, show all items
    if (value.length <= 3) {
      return value.map(item => formatValue(item)).join(", ");
    }
    
    // For longer arrays, show count
    return `${value.length} items`;
  }
  
  // Handle permission objects
  if (isPermissionObject(value)) {
    return formatPermission(value);
  }
  
  // Handle other objects
  if (typeof value === "object") {
    // Check if it's a date
    const dateFormatted = formatDate(value);
    if (dateFormatted) return dateFormatted;
    
    // For objects with few keys, show key-value pairs
    const keys = Object.keys(value);
    if (keys.length === 0) return "-";
    
    if (keys.length <= 2) {
      return keys
        .map(k => `${stringUtils.toTitleCase(k)}: ${formatValue((value as Record<string, unknown>)[k])}`)
        .join(", ");
    }
    
    // For larger objects, show summary
    return `${keys.length} properties`;
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
      key={logDetailsProps?.entityId || logDetailsProps?.entityReference}
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

              <span className="text-muted-foreground">Module</span>
              <span className="truncate">
                {logDetailsProps?.module}
              </span>

              <span className="text-muted-foreground">Action</span>
              <span className="truncate">
                {stringUtils.toTitleCase(
                  logDetailsProps?.action?.split("_")[0] ?? ""
                )}
              </span>

              <span className="text-muted-foreground">Reference</span>
              <span className="truncate">
                {logDetailsProps?.entityReference || logDetailsProps?.entityId || "-"}
              </span>
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
