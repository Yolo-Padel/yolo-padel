"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccessControlHeader } from "./_components/access-control-header";
import { RoleTable } from "./_components/role-table";
import { RoleTableLoading } from "./_components/role-table-loading";
import { RoleEmptyState } from "./_components/role-empty-state";
import { ErrorAlert } from "./_components/error-alert";
import { useRoles, useDeleteRole } from "@/hooks/use-rbac";
import { usePermissionGuard } from "@/hooks/use-permission-guard";

export default function AccessControlPage() {
  const router = useRouter();
  const { data: roles = [], isLoading, error } = useRoles();
  const deleteRole = useDeleteRole();

  const handleEdit = (roleId: string) => {
    router.push(`/admin/dashboard/access-control/${roleId}`);
  };

  const handleDelete = async (roleId: string) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this role? This action cannot be undone."
    );

    if (!confirmation) return;

    deleteRole.mutate(roleId);
  };

  const { canAccess: canCreateRole, isLoading: isCreateRolePermissionLoading } =
    usePermissionGuard({
      moduleKey: "roles",
      action: "create",
    });

  const { canAccess: canEditRole, isLoading: isEditRolePermissionLoading } =
    usePermissionGuard({
      moduleKey: "roles",
      action: "update",
    });

  const { canAccess: canDeleteRole, isLoading: isDeleteRolePermissionLoading } =
    usePermissionGuard({
      moduleKey: "roles",
      action: "delete",
    });

  return (
    <div className="space-y-6">
      <AccessControlHeader roleCount={roles.length} />
      <div>
        <p className="text-muted-foreground">
          Manage internal roles and their permission matrix per module.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Roles</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create a new role or manage existing ones.
            </p>
          </div>
          {canCreateRole && (
            <Button asChild disabled={isCreateRolePermissionLoading}>
              <Link href="/admin/dashboard/access-control/create">
                Create Role
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <ErrorAlert error={error?.message ?? null} />
          {isLoading ? (
            <RoleTableLoading />
          ) : roles.length === 0 ? (
            <RoleEmptyState />
          ) : (
            <RoleTable
              roles={roles}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeletingId={deleteRole.isPending ? deleteRole.variables : null}
              canEdit={canEditRole}
              canDelete={canDeleteRole}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
