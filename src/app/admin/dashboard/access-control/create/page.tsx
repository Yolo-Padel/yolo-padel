"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoleForm, type RoleFormValues } from "@/components/rbac/role-form";
import { rbacRequest } from "@/hooks/rbac/useRbacRequest";

export default function AccessControlCreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: RoleFormValues) => {
    try {
      setIsSubmitting(true);
      await rbacRequest("/api/rbac/roles", {
        method: "POST",
        body: JSON.stringify(values),
      });
      router.push("/admin/dashboard/access-control");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
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

      <Card>
        <CardHeader>
          <CardTitle>Role Information</CardTitle>
        </CardHeader>
        <CardContent>
          <RoleForm
            submitLabel="Create Role"
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
