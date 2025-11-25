"use client";

import type { Module, Permission } from "@prisma/client";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PermissionRow } from "./permission-row";

export interface RolePermissionEntry {
  moduleId: string;
  permissionId: string;
  allowed: boolean;
}

export interface PermissionMatrixProps {
  modules: Module[];
  permissions: Permission[];
  rolePermissions: RolePermissionEntry[];
  onToggle: (moduleId: string, permissionId: string, allowed: boolean) => void;
  isUpdating?: boolean;
  canEdit?: boolean;
}

export function PermissionMatrix({
  modules,
  permissions,
  rolePermissions,
  onToggle,
  isUpdating,
  canEdit,
}: PermissionMatrixProps) {
  const sortedModules = [...modules].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Module</TableHead>
            {permissions.map((permission) => (
              <TableHead key={permission.id} className="text-center capitalize">
                {permission.action}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedModules.map((module) => {
            const allowedMap = rolePermissions
              .filter((item) => item.moduleId === module.id)
              .reduce<Record<string, boolean>>((acc, item) => {
                acc[item.permissionId] = item.allowed;
                return acc;
              }, {});

            return (
              <PermissionRow
                key={module.id}
                module={module}
                permissions={permissions}
                allowedMap={allowedMap}
                onToggle={(permissionId, allowed) =>
                  onToggle(module.id, permissionId, allowed)
                }
                disabled={isUpdating || !canEdit}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
