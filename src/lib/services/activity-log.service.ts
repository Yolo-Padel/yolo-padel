import { prisma } from "@/lib/prisma";
import { requirePermission, ServiceContext } from "@/types/service-context";
import { ActionType } from "@/types/action";
import { EntityType } from "@/types/entity";
import { Role } from "@prisma/client";

type RecordActivityParams = {
  context: ServiceContext;
  action: ActionType;
  entityType: EntityType;
  entityId?: string | null;
  changes?: Record<string, unknown> | null;
  description?: string | null;
};

export type ChangesDiff = {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
};

export function buildChangesDiff<T extends Record<string, unknown>>(
  oldData: Partial<T>,
  newData: Partial<T>,
  keys?: Array<keyof T>
): ChangesDiff | null {
  const before: Record<string, unknown> = {};
  const after: Record<string, unknown> = {};

  const candidates = keys
    ? (keys as string[])
    : Array.from(new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]));

  let changed = false;
  for (const key of candidates) {
    const prevVal = (oldData as any)?.[key];
    const nextVal = (newData as any)?.[key];

    const prevDefined = typeof prevVal !== "undefined";
    const nextDefined = typeof nextVal !== "undefined";

    // Consider value changed if either side defined and values differ (shallow compare)
    const isDifferent = JSON.stringify(prevVal) !== JSON.stringify(nextVal);

    if ((prevDefined || nextDefined) && isDifferent) {
      before[key] = prevDefined ? prevVal : null;
      after[key] = nextDefined ? nextVal : null;
      changed = true;
    }
  }

  if (!changed) return null;
  return { before, after };
}

/**
 * Generate human-readable description from changes diff
 */
export function generateDescriptionFromChanges(
  action: ActionType,
  entityType: EntityType,
  changes?: Record<string, unknown> | null
): string | null {
  if (!changes) return null;

  // Check if changes follows { before, after } structure
  const isDiffFormat = changes.before !== undefined && changes.after !== undefined;
  
  if (!isDiffFormat) {
    return null;
  }

  const before = changes.before as Record<string, unknown>;
  const after = changes.after as Record<string, unknown>;
  
  const beforeKeys = Object.keys(before || {});
  const afterKeys = Object.keys(after || {});
  const allKeys = Array.from(new Set([...beforeKeys, ...afterKeys]));

  // Handle CREATE action (before is empty)
  if (action.includes("CREATE") || action.includes("INVITE")) {
    if (beforeKeys.length === 0 && afterKeys.length > 0) {
      const fieldList = allKeys.map(key => {
        const value = after[key];
        return `${key}: ${formatValue(value)}`;
      }).join(", ");
      return `Created ${entityType.toLowerCase()} with ${fieldList}`;
    }
  }

  // Handle DELETE action
  if (action.includes("DELETE")) {
    if (after.isArchived === true || (beforeKeys.length > 0 && afterKeys.length === 0)) {
      return `Deleted ${entityType.toLowerCase()}`;
    }
  }

  // Handle UPDATE action
  if (action.includes("UPDATE")) {
    const changeDescriptions: string[] = [];
    
    for (const key of allKeys) {
      const beforeVal = before[key];
      const afterVal = after[key];
      
      // Skip if values are the same
      if (JSON.stringify(beforeVal) === JSON.stringify(afterVal)) {
        continue;
      }

      // Handle isArchived change
      if (key === "isArchived") {
        if (afterVal === true) {
          changeDescriptions.push(`${entityType.toLowerCase()} archived`);
        } else if (afterVal === false) {
          changeDescriptions.push(`${entityType.toLowerCase()} restored`);
        }
        continue;
      }

      // Handle isActive change
      if (key === "isActive") {
        if (afterVal === true) {
          changeDescriptions.push(`${entityType.toLowerCase()} activated`);
        } else if (afterVal === false) {
          changeDescriptions.push(`${entityType.toLowerCase()} deactivated`);
        }
        continue;
      }

      // Generic field change
      const beforeFormatted = formatValue(beforeVal);
      const afterFormatted = formatValue(afterVal);
      
      if (beforeVal === null || beforeVal === undefined) {
        changeDescriptions.push(`added ${key}: ${afterFormatted}`);
      } else if (afterVal === null || afterVal === undefined) {
        changeDescriptions.push(`removed ${key}: ${beforeFormatted}`);
      } else {
        changeDescriptions.push(`${key} changed from ${beforeFormatted} to ${afterFormatted}`);
      }
    }

    if (changeDescriptions.length > 0) {
      return changeDescriptions.join(", ");
    }
  }

  return null;
}

/**
 * Format value for display in description
 */
function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export const activityLogService = {
  record: async ({
    context,
    action,
    entityType,
    entityId,
    changes,
  }: RecordActivityParams) => {
    try {
      // Auto-generate description if not provided
      const finalDescription = 
        generateDescriptionFromChanges(action, entityType, changes) || 
        null;

      await prisma.activityLog.create({
        data: {
          userId: context.actorUserId || null,
          action,
          entityType,
          entityId: entityId ?? null,
          // Prisma expects Json type; ensure undefined -> null for consistency
          changes: (changes as any) ?? null,
          description: finalDescription,
        },
      });
    } catch (error) {
      // Logging failure must be non-blocking
      console.error("recordActivity error:", error);
    }
  },
  getActivity: async (context: ServiceContext) => {
    try {
          const accessError = requirePermission(context, Role.ADMIN);
    
          if (accessError) return accessError;
          // Get all users
          const activityLogs = await prisma.activityLog.findMany({
            include: { user: { include: { profile: true } } }, 
            orderBy: { createdAt: "desc" },
          });
          return {
            success: true,
            data: activityLogs,
            message: "Activity logs retrieved successfully",
          };
        } catch (error) {
          console.error("getActivity error:", error);
          return {
            success: false,
            message: "Internal server error",
          };
        }
      }
}
