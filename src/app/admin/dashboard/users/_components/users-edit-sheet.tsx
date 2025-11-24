"use client";

import * as React from "react";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(32).optional().or(z.literal("")),
  firstName: z.string().min(1).max(64).optional().or(z.literal("")),
  lastName: z.string().min(1).max(64).optional().or(z.literal("")),
  userType: z.enum(["STAFF", "USER"]),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
});

type UserType = "STAFF" | "USER";

type UserRow = {
  id: string;
  email: string;
  username?: string | null;
  userType: UserType;
  isActive: boolean;
  isEmailVerified: boolean;
  profile?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

export function UsersEditSheet({
  open,
  onOpenChange,
  user,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: UserRow | null;
  onSubmit: (values: z.infer<typeof schema>) => Promise<void> | void;
}) {
  const [values, setValues] = React.useState<z.infer<typeof schema>>({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    userType: "USER",
    isActive: true,
    isEmailVerified: false,
  });
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof z.infer<typeof schema>, string>>
  >({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    if (user) {
      setValues({
        email: user.email,
        username: user.username ?? "",
        firstName: user.profile?.firstName ?? "",
        lastName: user.profile?.lastName ?? "",
        userType: user.userType,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
      });
      setErrors({});
    }
  }, [open, user]);

  function handleChange<K extends keyof z.infer<typeof schema>>(
    key: K,
    val: z.infer<typeof schema>[K]
  ) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as keyof z.infer<typeof schema>;
        fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    try {
      setSubmitting(true);
      await onSubmit(parsed.data);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  const fullName =
    [values.firstName, values.lastName].filter(Boolean).join(" ") || "-";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-4 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription>
            Update data user dan profile. Perubahan ini hanya dummy pada sisi
            UI.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 px-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
              type="email"
              placeholder="m@example.com"
            />
            {errors.email && (
              <p className="text-destructive mt-1 text-xs">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Username</label>
            <Input
              value={values.username ?? ""}
              onChange={(e) => handleChange("username", e.target.value)}
              placeholder="username"
            />
            {errors.username && (
              <p className="text-destructive mt-1 text-xs">{errors.username}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                First name
              </label>
              <Input
                value={values.firstName ?? ""}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-destructive mt-1 text-xs">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Last name
              </label>
              <Input
                value={values.lastName ?? ""}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="text-destructive mt-1 text-xs">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                User Type
              </label>
              <select
                className={cn(
                  "bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring text-sm",
                  "border-input focus-visible:ring-2 flex h-9 w-full rounded-md border px-3 py-1"
                )}
                value={values.userType}
                onChange={(e) =>
                  handleChange("userType", e.target.value as UserType)
                }
              >
                <option value="STAFF">STAFF</option>
                <option value="USER">USER</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Badge variant="secondary">{fullName}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.isEmailVerified}
                onChange={(e) =>
                  handleChange("isEmailVerified", e.target.checked)
                }
              />
              Email Verified
            </label>
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              Save changes
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
