"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRoleSchema } from "@/lib/validations/rbac.validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const roleFormSchema = createRoleSchema.pick({
  name: true,
  description: true,
  isActive: true,
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

export interface RoleFormProps {
  defaultValues?: Partial<RoleFormValues>;
  submitLabel?: string;
  onSubmit: (values: RoleFormValues) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function RoleForm({
  defaultValues,
  submitLabel = "Simpan",
  onSubmit,
  onCancel,
  isSubmitting,
}: RoleFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, control, formState } =
    useForm<RoleFormValues>({
      resolver: zodResolver(roleFormSchema),
      defaultValues: {
        name: "",
        description: "",
        isActive: true,
        ...defaultValues,
      },
    });

  const { errors } = formState;

  const submitHandler = handleSubmit(async (values) => {
    try {
      setFormError(null);
      await onSubmit(values);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Gagal menyimpan role"
      );
    }
  });

  return (
    <form onSubmit={submitHandler} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Role</Label>
          <Input id="name" placeholder="super_admin" {...register("name")} />
          {errors.name ? (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            placeholder="Tambahkan deskripsi singkat"
            rows={4}
            {...register("description")}
          />
          {errors.description ? (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          ) : null}
        </div>

        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between rounded-md border p-4">
              <div>
                <p className="font-medium">Status aktif</p>
                <p className="text-sm text-muted-foreground">
                  Nonaktifkan jika role tidak boleh digunakan.
                </p>
              </div>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-label="Status aktif role"
              />
            </div>
          )}
        />
      </div>

      {formError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {formError}
        </div>
      ) : null}

      <div className="flex justify-end gap-3">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Batal
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
