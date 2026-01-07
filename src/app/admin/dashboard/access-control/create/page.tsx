"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RoleFormCard } from "../_components/role-form-card";
import { RoleForm, type RoleFormValues } from "../_components/role-form";
import { useCreateRole } from "@/hooks/use-rbac";

export default function AccessControlCreatePage() {
  const router = useRouter();
  const createRole = useCreateRole();

  const handleSubmit = async (values: RoleFormValues) => {
    createRole.mutate(
      {
        name: values.name,
        description: values.description ?? undefined,
        isActive: values.isActive,
      },
      {
        onSuccess: () => {
          router.push("/admin/dashboard/access-control");
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create Role</h1>
          <p className="text-muted-foreground">
            Define the role name and status before managing permissions.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/dashboard/access-control">Back</Link>
        </Button>
      </div>

      <RoleFormCard title="Role Information">
        <RoleForm
          submitLabel="Create Role"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isSubmitting={createRole.isPending}
        />
      </RoleFormCard>
    </div>
  );
}
