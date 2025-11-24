"use client";

import type { Module, Permission } from "@prisma/client";
import { TableCell, TableRow } from "@/components/ui/table";
import { PermissionCell } from "./permission-cell";

export interface PermissionRowProps {
  module: Module;
  permissions: Permission[];
  allowedMap: Record<string, boolean>;
  onToggle: (permissionId: string, allowed: boolean) => void;
  disabled?: boolean;
}

export function PermissionRow({
  module,
  permissions,
  allowedMap,
  onToggle,
  disabled,
}: PermissionRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{module.label}</span>
          {module.description ? (
            <span className="text-sm text-muted-foreground">
              {module.description}
            </span>
          ) : null}
        </div>
      </TableCell>
      {permissions.map((permission) => {
        const isAllowed = allowedMap[permission.id] ?? false;
        return (
          <PermissionCell
            key={permission.id}
            permission={permission}
            module={module}
            isAllowed={isAllowed}
            onToggle={(allowed) => onToggle(permission.id, allowed)}
            disabled={disabled}
          />
        );
      })}
    </TableRow>
  );
}
