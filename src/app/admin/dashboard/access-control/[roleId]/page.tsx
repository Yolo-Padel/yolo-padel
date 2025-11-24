"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  RoleFormCard,
  RoleForm,
  type RoleFormValues,
  PermissionMatrix,
  PermissionMatrixLoading,
  PermissionMatrixEmpty,
  ErrorAlert,
} from "../_components";
import {
  useRoleById,
  useModules,
  useRolePermissions,
  useUpdateRole,
  useUpdateRolePermissions,
} from "@/hooks/use-rbac";

export default function AccessControlDetailPage() {
  const params = useParams<{ roleId: string }>();
  const roleId = params?.roleId ?? "";
  const router = useRouter();

  // Fetch data using hooks
  const {
    data: role,
    isLoading: roleLoading,
    error: roleError,
  } = useRoleById(roleId);
  const {
    data: modulesData,
    isLoading: modulesLoading,
    error: modulesError,
  } = useModules();
  const {
    data: rolePermissions = [],
    isLoading: permissionsLoading,
    error: permissionsError,
  } = useRolePermissions(roleId);

  // Mutations
  const updateRole = useUpdateRole();
  const updateRolePermissions = useUpdateRolePermissions();

  // Derived state
  const isLoading = roleLoading || modulesLoading || permissionsLoading;
  const modules = modulesData?.modules || [];
  const permissions = modulesData?.permissions || [];

  const handleRoleSubmit = async (values: RoleFormValues) => {
    updateRole.mutate({
      roleId,
      data: {
        name: values.name,
        description: values.description ?? undefined,
        isActive: values.isActive,
      },
    });
  };

  const handleTogglePermission = async (
    moduleId: string,
    permissionId: string,
    allowed: boolean
  ) => {
    updateRolePermissions.mutate({
      roleId,
      updates: [{ moduleId, permissionId, allowed }],
    });
  };

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

      <ErrorAlert
        error={
          roleError?.message ||
          modulesError?.message ||
          permissionsError?.message ||
          null
        }
      />

      {isLoading ? (
        <div className="space-y-6">
          <RoleFormCard title="Role Information">
            <div className="space-y-4">
              <div className="h-10 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
              <div className="h-20 bg-muted animate-pulse rounded" />
            </div>
          </RoleFormCard>
          <PermissionMatrixLoading />
        </div>
      ) : role ? (
        <>
          <RoleFormCard title="Role Information">
            <RoleForm
              defaultValues={{
                name: role.name,
                description: role.description ?? "",
                isActive: role.isActive,
              }}
              submitLabel="Save Changes"
              onSubmit={handleRoleSubmit}
              onCancel={() => router.back()}
              isSubmitting={updateRole.isPending}
            />
          </RoleFormCard>

          <RoleFormCard title="Permission Matrix">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Toggle module permissions using the switches below.
              </p>
              {modules.length === 0 || permissions.length === 0 ? (
                <PermissionMatrixEmpty />
              ) : (
                <PermissionMatrix
                  modules={modules}
                  permissions={permissions}
                  rolePermissions={rolePermissions}
                  onToggle={handleTogglePermission}
                  isUpdating={updateRolePermissions.isPending}
                />
              )}
            </div>
          </RoleFormCard>
        </>
      ) : (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          Role not found or has been deleted.
        </div>
      )}
    </div>
  );
}
