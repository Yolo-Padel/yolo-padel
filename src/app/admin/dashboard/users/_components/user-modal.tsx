"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectItem,
} from "@/components/ui/multi-select";
import { X } from "lucide-react";
import { User, Profile, Role, Venue } from "@/types/prisma";
import { useInviteUser, useUpdateUser } from "@/hooks/use-users";
import {
  userCreateSchema,
  UserCreateData,
  UserUpdateData,
} from "@/lib/validations/user.validation";
import { useVenue } from "@/hooks/use-venue";

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  user?: User & { profile?: Profile | null };
}

type UserFormData = {
  email: string;
  role: Role;
  fullName: string;
  assignedVenueIds: string[];
};

export function UserModal({ open, onOpenChange, mode, user }: UserModalProps) {
  const inviteUserMutation = useInviteUser();
  const updateUserMutation = useUpdateUser();
  const { data: venues, isLoading: isLoadingVenues } = useVenue();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userCreateSchema) as any,
    defaultValues: {
      fullName: "",
      email: "",
      role: Role.USER,
      assignedVenueIds: [],
    },
  });

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && user) {
        setValue("fullName", user.profile?.fullName || "");
        setValue("email", user.email);
        setValue("role", user.role);
        setValue("assignedVenueIds", user.assignedVenueIds || []);
      } else {
        reset({
          fullName: "",
          email: "",
          role: Role.USER,
          assignedVenueIds: [],
        });
      }
    }
  }, [open, mode, user, setValue, reset]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (mode === "add") {
        await inviteUserMutation.mutateAsync(data);
        onOpenChange(false);
      } else {
        if (!user) return;
        const payload: UserUpdateData = {
          userId: user.id,
          email: data.email,
          role: data.role,
          fullName: data.fullName,
          assignedVenueIds: data.assignedVenueIds,
        };
        await updateUserMutation.mutateAsync(payload);
        onOpenChange(false);
      }
    } catch (error) {
      // Error handling is done in the mutation
      console.error("Submit error:", error);
    }
  };

  const isAddMode = mode === "add";
  const title = isAddMode ? "Invite New User" : "Edit User";
  const description = isAddMode
    ? "Add a new member or admin to your YOLO Padel system. They'll receive an email invitation to join right away."
    : "Update user information, role, or access permissions.";
  const primaryButtonText = isAddMode ? "Send Invitation" : "Save Changes";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[545px]" showCloseButton={false}>
        <div className="relative">
          <DialogHeader className="pr-8 gap-0">
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              {description}
            </DialogDescription>
          </DialogHeader>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name Input */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter full name"
              {...register("fullName")}
              className="w-full"
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("role")}
              onValueChange={(value) => {
                setValue("role", value as Role);
                // Reset assignedVenueIds if role is USER
                if (value === Role.USER) {
                  setValue("assignedVenueIds", []);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Role.USER}>User</SelectItem>
                <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                <SelectItem value={Role.SUPER_ADMIN}>Super Admin</SelectItem>
                <SelectItem value={Role.FINANCE}>Finance</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* Venue Assignment - Only show if role is not USER */}
          {watch("role") === Role.ADMIN && (
            <div className="space-y-2">
              <Label htmlFor="assignedVenueIds" className="text-sm font-medium">
                Assigned Venues
              </Label>
              <MultiSelect
                values={watch("assignedVenueIds")}
                onValuesChange={(values) =>
                  setValue("assignedVenueIds", values)
                }
              >
                <MultiSelectTrigger className="w-full">
                  <MultiSelectValue
                    placeholder={
                      isLoadingVenues ? "Loading venues..." : "Select venues"
                    }
                  />
                </MultiSelectTrigger>
                <MultiSelectContent
                  search={{
                    placeholder: "Search venues...",
                    emptyMessage: "No venues found",
                  }}
                >
                  {venues?.data?.map((venue: Venue) => (
                    <MultiSelectItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </MultiSelectItem>
                  ))}
                </MultiSelectContent>
              </MultiSelect>
              {errors.assignedVenueIds && (
                <p className="text-sm text-red-500">
                  {errors.assignedVenueIds.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              {...register("email")}
              className="w-full"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-primary text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : primaryButtonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
