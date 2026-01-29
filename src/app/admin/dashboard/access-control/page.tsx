"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccessControlHeader } from "./_components/access-control-header";
import { RoleTable } from "./_components/role-table";
import { RoleTableLoading } from "./_components/role-table-loading";
import { RoleEmptyState } from "./_components/role-empty-state";
import { ErrorAlert } from "./_components/error-alert";
import { DeleteRoleConfirmationModal } from "./_components/delete-role-confirmation-modal";
import { useRoles, useDeleteRole } from "@/hooks/use-rbac";
import { usePermissionGuard } from "@/hooks/use-permission-guard";

export default function AccessControlPage() {
  const router = useRouter();
  const { data: roles = [], isLoading, error } = useRoles();
  const deleteRole = useDeleteRole();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleEdit = (roleId: string) => {
    router.push(`/admin/dashboard/access-control/${roleId}`);
  };

  const handleDelete = async (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    setRoleToDelete({
      id: roleId,
      name: role?.name || "",
    });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (roleToDelete) {
      deleteRole.mutate(roleToDelete.id, {
        onSuccess: () => {
          setShowDeleteConfirm(false);
          setRoleToDelete(null);
        },
      });
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteRole.isPending) {
      setShowDeleteConfirm(false);
      setRoleToDelete(null);
    }
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
            <Button
              asChild
              disabled={isCreateRolePermissionLoading}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
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

      {/* Delete Confirmation Modal */}
      <DeleteRoleConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        roleName={roleToDelete?.name}
        isDeleting={deleteRole.isPending}
      />
    </div>
  );
}
