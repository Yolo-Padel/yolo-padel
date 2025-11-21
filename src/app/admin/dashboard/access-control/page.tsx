"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleTable } from "@/components/rbac/role-table";
import { useRoles } from "@/hooks/rbac/useRoles";
import { rbacRequest } from "@/hooks/rbac/useRbacRequest";

export default function AccessControlPage() {
  const { roles, isLoading, error, refetch } = useRoles();
  const [pageError, setPageError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleEdit = (roleId: string) => {
    router.push(`/admin/dashboard/access-control/${roleId}`);
  };

  const handleDelete = async (roleId: string) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this role? This action cannot be undone."
    );

    if (!confirmation) return;

    try {
      setPageError(null);
      setDeletingId(roleId);
      await rbacRequest(`/api/rbac/roles/${roleId}`, { method: "DELETE" });
      await refetch();
    } catch (err) {
      setPageError(
        err instanceof Error ? err.message : "Failed to delete role"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Access Control
        </h1>
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
          <Button asChild>
            <Link href="/admin/dashboard/access-control/create">
              Create Role
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {pageError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {pageError}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}
          {isLoading ? (
            <div className="h-32 animate-pulse rounded-lg border border-dashed" />
          ) : (
            <RoleTable
              roles={roles}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeletingId={deletingId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
