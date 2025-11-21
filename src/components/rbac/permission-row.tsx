"use client";

import type { Module, Permission } from "@prisma/client";
import { TableCell, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

interface PermissionRowProps {
  module: Module;
  permissions: Permission[];
  allowedMap: Record<string, boolean>;
  onToggle: (permissionId: string, nextValue: boolean) => void;
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
          <TableCell key={permission.id} className="text-center">
            <Switch
              checked={isAllowed}
              onCheckedChange={(checked) => onToggle(permission.id, checked)}
              disabled={disabled}
              aria-label={`${permission.action} ${module.label}`}
            />
          </TableCell>
        );
      })}
    </TableRow>
  );
}

