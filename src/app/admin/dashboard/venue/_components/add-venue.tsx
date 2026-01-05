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
import { Eye, EyeOff, X } from "lucide-react";

type VenueFormValues = VenueFormData;

export function VenueFormSheet({
  open,
  onOpenChange,
  venueData,
  mode = "create",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  venueData:
    | (Partial<VenueFormValues> & {
        courtsideApiKey?: string | null;
        hasCourtsideApiKey?: boolean;
      })
    | null;
  mode?: "create" | "edit";
}) {
  const createMutation = useCreateVenue();
  const updateMutation = useUpdateVenue();

  // State for API key visibility and editing
  const [showApiKey, setShowApiKey] = useState(false);
  const [isEditingApiKey, setIsEditingApiKey] = useState(false);

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
      courtsideApiKey: null,
    },
  });

  // Track if venue has existing API key (from server)
  const hasExistingApiKey = mode === "edit" && venueData?.hasCourtsideApiKey;
  const maskedApiKey = venueData?.courtsideApiKey;

  useEffect(() => {
    if (!open) return;

    // Reset API key editing state when sheet opens
    setIsEditingApiKey(false);
    setShowApiKey(false);

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
        courtsideApiKey: null, // Don't populate with masked value
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
        courtsideApiKey: null,
      });
    }
  }, [open, mode, reset]);

  const onSubmit: SubmitHandler<VenueFormValues> = async (values) => {
    // Ensure only single image is submitted
    const imagesOne: string[] = (values.images ?? []).slice(0, 1);

    // Handle API key logic:
    // - Create mode: always send the value
    // - Edit mode with existing key: only send if user clicked "Change" (isEditingApiKey)
    // - Edit mode without existing key: always send the value (user is typing directly)
    const shouldSendApiKey =
      mode === "create" || isEditingApiKey || !hasExistingApiKey;

    const apiKeyToSend = shouldSendApiKey
      ? values.courtsideApiKey || null
      : undefined; // undefined means don't update

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
        ...(apiKeyToSend !== undefined && { courtsideApiKey: apiKeyToSend }),
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
        courtsideApiKey: values.courtsideApiKey || null,
      });
    }
    onOpenChange(false);
  };

  // Handle clearing the API key
  const handleClearApiKey = () => {
    setValue("courtsideApiKey", "");
    setIsEditingApiKey(true);
  };

  // Handle starting to edit API key
  const handleStartEditApiKey = () => {
    setIsEditingApiKey(true);
    setValue("courtsideApiKey", "");
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
            {/* Integration Settings Section - At top with special styling */}
            <div className="space-y-4 p-4 border border-dashed border-primary/50 rounded-lg bg-primary/5">
              <div>
                <h3 className="text-sm font-medium">Integration Settings</h3>
                <p className="text-xs text-muted-foreground">
                  Configure third-party integrations for this venue
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Courtside API Key</Label>
                {mode === "edit" && hasExistingApiKey && !isEditingApiKey ? (
                  // Show masked value with edit/clear buttons
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Input
                        type="text"
                        value={maskedApiKey || ""}
                        disabled
                        className="pr-10 bg-muted"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleStartEditApiKey}
                    >
                      Change
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearApiKey}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  // Show editable input
                  <div className="relative">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      placeholder="Enter Courtside API key"
                      {...register("courtsideApiKey")}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  API key for authenticating with the Courtside system
                </p>
              </div>
            </div>

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
              className="w-1/2 text-black font-normal"
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
