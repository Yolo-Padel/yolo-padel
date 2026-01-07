"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  venueFormSchema,
  VenueFormData,
} from "@/lib/validations/venue.validation";
import { FileUploader } from "@/components/file-uploader";
import { useCreateVenue, useUpdateVenue } from "@/hooks/use-venue";

type VenueFormValues = VenueFormData;

export function VenueFormSheet({
  open,
  onOpenChange,
  venueData,
  mode = "create",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  venueData: Partial<VenueFormValues> | null;
  mode?: "create" | "edit";
}) {
  const createMutation = useCreateVenue();
  const updateMutation = useUpdateVenue();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<VenueFormValues>({
    resolver: zodResolver(venueFormSchema) as any,
    defaultValues: {
      id: undefined,
      name: "",
      address: "",
      description: "",
      images: undefined,
      city: "",
      phone: "",
      openHour: "07:00",
      closeHour: "23:00",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && venueData) {
      reset({
        id: venueData.id,
        name: venueData.name ?? "",
        address: venueData.address ?? "",
        description: (venueData as any).description ?? "",
        images: ((venueData as any).images ?? []).slice(0, 1),
        city: (venueData as any).city ?? "",
        phone: (venueData as any).phone ?? "",
        openHour: (venueData as any).openHour ?? "07:00",
        closeHour: (venueData as any).closeHour ?? "23:00",
        isActive: (venueData as any).isActive ?? true,
      });
    } else if (mode === "create") {
      reset({
        id: undefined,
        name: "",
        address: "",
        description: "",
        images: [],
        city: "",
        phone: "",
        openHour: "07:00",
        closeHour: "23:00",
        isActive: true,
      });
    }
  }, [open, mode, reset]);

  const onSubmit: SubmitHandler<VenueFormValues> = async (values) => {
    // Ensure only single image is submitted
    const imagesOne: string[] = (values.images ?? []).slice(0, 1);

    if (mode === "edit" && values.id) {
      await updateMutation.mutateAsync({
        venueId: values.id,
        name: values.name,
        address: values.address,
        description: values.description,
        images: imagesOne,
        city: values.city,
        phone: values.phone,
        openHour: values.openHour,
        closeHour: values.closeHour,
        isActive: values.isActive,
      });
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        address: values.address,
        description: values.description,
        images: imagesOne,
        city: values.city,
        phone: values.phone,
        openHour: values.openHour,
        closeHour: values.closeHour,
        isActive: values.isActive,
      });
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 w-[600px] sm:w-[540px] h-full">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>
            {mode === "edit" ? "Edit Venue" : "Add New Venue"}
          </SheetTitle>
          <SheetDescription>
            {mode === "edit"
              ? "Update venue details here."
              : "Add new venue details here."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form
            onSubmit={handleSubmit(onSubmit as SubmitHandler<any>)}
            className="space-y-6"
          >
            <div className="grid gap-2">
              <Label>
                Venue Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Slipi Padel Center"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Phone Number (Optional)</Label>
              <Input
                type="tel"
                placeholder="e.g. 08325252908"
                {...register("phone")}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="e.g. Jl. Raya Bogor No. 123"
                {...register("address")}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                City <span className="text-red-500">*</span>
              </Label>
              <Input placeholder="e.g. Jakarta" {...register("city")} />
            </div>

            <div className="flex flex-row justify-between gap-4">
              <div className="flex-1 w-full space-y-2">
                <Label>
                  Opening Hour <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch("openHour")}
                  onValueChange={(value) => setValue("openHour", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select opening hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, "0");
                      return (
                        <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 w-full space-y-2">
                <Label>
                  Closing Hour <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch("closeHour")}
                  onValueChange={(value) => setValue("closeHour", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select closing hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, "0");
                      return (
                        <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>
                Photo Venue <span className="text-red-500">*</span>
              </Label>
              <FileUploader
                folderPath="venue"
                value={((watch("images") as string[] | undefined) ?? []).slice(
                  0,
                  1,
                )}
                onChange={(urls) =>
                  setValue("images", (urls ?? []).slice(0, 1))
                }
                multiple={false}
                maxFiles={1}
              />
              {errors.images && (
                <p className="text-xs text-red-500">
                  {String(
                    errors.images.message || "At least one image is required",
                  )}
                </p>
              )}
            </div>
          </form>
        </div>

        <SheetFooter className="px-6 py-4 border-t bg-background">
          <div className="flex justify-between gap-2 w-full">
            <SheetClose asChild>
              <Button
                className="w-1/2 text-black font-normal"
                variant="outline"
              >
                Close
              </Button>
            </SheetClose>
            <Button
              className="w-1/2 bg-brand text-brand-foreground hover:bg-brand/90 font-normal"
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit as SubmitHandler<any>)}
            >
              {isSubmitting
                ? mode === "edit"
                  ? "Saving..."
                  : "Adding..."
                : mode === "edit"
                  ? "Save Changes"
                  : "Add Venue"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
