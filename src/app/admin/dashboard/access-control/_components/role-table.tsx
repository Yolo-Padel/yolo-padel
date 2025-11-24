"use client";

import type { RoleWithPermissionCount } from "@/hooks/use-rbac";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface RoleTableProps {
  roles: RoleWithPermissionCount[];
  onEdit: (roleId: string) => void;
  onDelete: (roleId: string) => void;
  isDeletingId: string | null;
}

export function RoleTable({
  roles,
  onEdit,
  onDelete,
  isDeletingId,
}: RoleTableProps) {
  return (
    <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Jumlah Permissions</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => {
            const permissionCount = role.allowedPermissionCount;

            return (
              <TableRow key={role.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium capitalize">{role.name}</span>
                    {role.description ? (
                      <span className="text-sm text-muted-foreground">
                        {role.description}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={role.isActive ? "default" : "secondary"}>
                    {role.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell>{permissionCount}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(role.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(role.id)}
                    disabled={isDeletingId === role.id}
                  >
                    {isDeletingId === role.id ? "Menghapus..." : "Hapus"}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
