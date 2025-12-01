"use client";

import type { Module, Permission } from "@prisma/client";
import { TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

export interface PermissionCellProps {
  permission: Permission;
  module: Module;
  isAllowed: boolean;
  onToggle: (allowed: boolean) => void;
  disabled?: boolean;
}

export function PermissionCell({
  permission,
  module,
  isAllowed,
  onToggle,
  disabled,
}: PermissionCellProps) {
  return (
    <TableCell className="text-center">
      <Switch
        checked={isAllowed}
        onCheckedChange={onToggle}
        disabled={disabled}
        aria-label={`${permission.action} ${module.label}`}
      />
    </TableCell>
  );
}
