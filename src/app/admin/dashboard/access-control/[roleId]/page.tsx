"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoleForm, type RoleFormValues } from "@/components/rbac/role-form";
import { PermissionMatrix } from "@/components/rbac/permission-matrix";
import { useRole } from "@/hooks/rbac/useRole";
import { useModules } from "@/hooks/rbac/useModules";
import { useRolePermissions } from "@/hooks/rbac/useRolePermissions";
import { useUpdateRolePermissions } from "@/hooks/rbac/useUpdateRolePermissions";
import { rbacRequest } from "@/hooks/rbac/useRbacRequest";
import { Loader2 } from "lucide-react";

export default function AccessControlDetailPage() {
  const params = useParams<{ roleId: string }>();
  const roleId = params?.roleId ?? "";
  const router = useRouter();
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const {
    role,
    isLoading: roleLoading,
    error: roleError,
    refetch: refetchRole,
  } = useRole(roleId);
  const {
    modules,
    permissions,
    isLoading: modulesLoading,
    error: modulesError,
  } = useModules();
  const {
    permissions: rolePermissions,
    isLoading: rolePermissionsLoading,
    error: rolePermissionsError,
    refetch: refetchRolePermissions,
  } = useRolePermissions(roleId);
  const { updatePermissions, isUpdating } = useUpdateRolePermissions(roleId);

  const handleRoleSubmit = async (values: RoleFormValues) => {
    try {
      setFormSubmitting(true);
      await rbacRequest(`/api/rbac/roles/${roleId}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      await refetchRole();
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleTogglePermission = async (
    moduleId: string,
    permissionId: string,
    allowed: boolean
  ) => {
    try {
      setPermissionError(null);
      await updatePermissions([{ moduleId, permissionId, allowed }]);
      await refetchRolePermissions();
    } catch (error) {
      setPermissionError(
        error instanceof Error
          ? error.message
          : "Failed to update role permissions"
      );
    }
  };

  const isLoading = roleLoading || modulesLoading || rolePermissionsLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manage Role</h1>
          <p className="text-muted-foreground">
            Update role information and adjust the permission matrix per module.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/dashboard/access-control">Back</Link>
        </Button>
      </div>

      {roleError || modulesError || rolePermissionsError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {roleError || modulesError || rolePermissionsError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-4 flex items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : role ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Role Information</CardTitle>
            </CardHeader>
            <CardContent>
              <RoleForm
                defaultValues={{
                  name: role.name,
                  description: role.description ?? "",
                  isActive: role.isActive,
                }}
                submitLabel="Save Changes"
                onSubmit={handleRoleSubmit}
                onCancel={() => router.back()}
                isSubmitting={formSubmitting}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Toggle module permissions using the switches below.
              </p>
              {permissionError ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {permissionError}
                </div>
              ) : null}
              <PermissionMatrix
                modules={modules}
                permissions={permissions}
                rolePermissions={rolePermissions}
                onToggle={handleTogglePermission}
                isUpdating={isUpdating}
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          Role not found or has been deleted.
        </div>
      )}
    </div>
  );
}
