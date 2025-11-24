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

const PERMISSION_ORDER = ["create", "read", "update", "delete"];

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
}

export function PermissionMatrix({
  modules,
  permissions,
  rolePermissions,
  onToggle,
  isUpdating,
}: PermissionMatrixProps) {
  // Sort permissions in CRUD order
  // const sortedPermissions = [...permissions].sort((a, b) => {
  //   const indexA =
  //     PERMISSION_ORDER.indexOf(a.action) !== -1
  //       ? PERMISSION_ORDER.indexOf(a.action)
  //       : PERMISSION_ORDER.length;
  //   const indexB =
  //     PERMISSION_ORDER.indexOf(b.action) !== -1
  //       ? PERMISSION_ORDER.indexOf(b.action)
  //       : PERMISSION_ORDER.length;
  //   return indexA - indexB;
  // });

  // Sort modules by orderIndex
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
                disabled={isUpdating}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
