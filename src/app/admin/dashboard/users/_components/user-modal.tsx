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
import { User, Profile, UserType, Venue, Membership } from "@/types/prisma";
import { useInviteUser, useUpdateUser } from "@/hooks/use-users";
import {
  userCreateSchema,
  UserUpdateData,
} from "@/lib/validations/user.validation";
import { useVenue } from "@/hooks/use-venue";
import { useMemberships } from "@/hooks/use-membership";
import { useRoles } from "@/hooks/use-rbac";

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit" | "view";
  user?: User & { profile?: Profile | null };
  isStaffOnly?: boolean;
}

type UserFormData = {
  email: string;
  userType: UserType;
  fullName: string;
  assignedVenueIds: string[];
  membershipId?: string;
  roleId?: string;
};

export function UserModal({
  open,
  onOpenChange,
  mode,
  user,
  isStaffOnly = false,
}: UserModalProps) {
  const inviteUserMutation = useInviteUser();
  const updateUserMutation = useUpdateUser();
  const { data: venues, isLoading: isLoadingVenues } = useVenue();
  const { data: memberships, isLoading: isLoadingMemberships } =
    useMemberships();
  const { data: roles, isLoading: isLoadingRoles } = useRoles();

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
      userType: UserType.USER,
      assignedVenueIds: [],
      membershipId: "",
      roleId: "",
    },
  });

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (open) {
      if ((mode === "edit" || mode === "view") && user) {
        setValue("fullName", user.profile?.fullName || "");
        setValue("email", user.email);
        setValue("userType", user.userType);
        setValue("assignedVenueIds", user.assignedVenueIds || []);
        setValue("membershipId", user.membershipId || "");
        setValue("roleId", user.roleId || "");
      } else {
        reset({
          fullName: "",
          email: "",
          userType: isStaffOnly ? UserType.STAFF : UserType.USER,
          assignedVenueIds: [],
          membershipId: "",
          roleId: "",
        });
      }
    }
  }, [open, mode, user, setValue, reset, isStaffOnly]);

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
          userType: data.userType,
          fullName: data.fullName,
          assignedVenueIds: data.assignedVenueIds,
          membershipId: data.membershipId,
          roleId: data.roleId,
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
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view";
  const title = isAddMode
    ? "Invite New User"
    : isEditMode
      ? "Edit User"
      : "User Details";
  const description = isAddMode
    ? "Add a new member or staff to your YOLO Padel system. They'll receive an email invitation to join right away."
    : isEditMode
      ? "Update user information, user type."
      : "View user information, user type.";
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
            size="icon"
            className="absolute top-0 right-0 h-8 w-8 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
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
              disabled={isViewMode}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="userType" className="text-sm font-medium">
              User Type <span className="text-red-500">*</span>
            </Label>
            {isStaffOnly ? (
              <Select
                value={watch("userType")}
                onValueChange={(value) => {
                  setValue("userType", value as UserType);
                }}
                disabled={isViewMode}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserType.STAFF}>Staff</SelectItem>
                  <SelectItem value={UserType.ADMIN}>Admin</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Select
                value={watch("userType")}
                onValueChange={(value) => {
                  setValue("userType", value as UserType);
                  // Reset assignedVenueIds and roleId if userType is USER
                  if (value === UserType.USER) {
                    setValue("assignedVenueIds", []);
                    setValue("roleId", "");
                  }
                }}
                disabled={isViewMode}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserType.USER}>User</SelectItem>
                  <SelectItem value={UserType.STAFF}>Staff</SelectItem>
                </SelectContent>
              </Select>
            )}
            {errors.userType && (
              <p className="text-sm text-red-500">{errors.userType.message}</p>
            )}
          </div>

          {!isStaffOnly && watch("userType") === UserType.USER && (
            <div className="space-y-2">
              <Label htmlFor="membershipId" className="text-sm font-medium">
                Membership
              </Label>
              <Select
                value={watch("membershipId")}
                onValueChange={(value) => setValue("membershipId", value)}
                disabled={isViewMode}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingMemberships
                        ? "Loading memberships..."
                        : memberships?.data?.length === 0
                          ? "No memberships found"
                          : "Select Membership"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {memberships?.data?.map((membership: Membership) => (
                    <SelectItem key={membership.id} value={membership.id}>
                      {membership.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Access Role - Only show if userType is STAFF or ADMIN (staff management) */}
          {(isStaffOnly || watch("userType") === UserType.STAFF) && (
            <div className="space-y-2">
              <Label htmlFor="roleId" className="text-sm font-medium">
                Access Role
              </Label>
              <Select
                value={watch("roleId")}
                onValueChange={(value) => setValue("roleId", value)}
                disabled={isViewMode}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingRoles
                        ? "Loading roles..."
                        : roles?.length === 0
                          ? "No roles found"
                          : "Select Access Role"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleId && (
                <p className="text-sm text-red-500">{errors.roleId.message}</p>
              )}
            </div>
          )}

          {/* Venue Assignment - Only show if userType is STAFF or ADMIN (staff management) */}
          {(isStaffOnly || watch("userType") === UserType.STAFF) && (
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
                <MultiSelectTrigger className="w-full" disabled={isViewMode}>
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
              disabled={isViewMode}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {!isViewMode && (
            <div className="flex gap-3 pt-4 w-full">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-primary/20 text-black hover:bg-primary/60 border border-primary"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : primaryButtonText}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
