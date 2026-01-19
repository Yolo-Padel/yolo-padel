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
import { X } from "lucide-react";
import { User, Profile, UserType, Membership } from "@/types/prisma";
import { useInviteUser, useUpdateUser } from "@/hooks/use-users";
import {
  userCreateSchema,
  UserUpdateData,
} from "@/lib/validations/user.validation";
import { useMemberships } from "@/hooks/use-membership";

interface CustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit" | "view";
  customer?: User & { profile?: Profile | null };
}

type CustomerFormData = {
  email: string;
  userType: UserType;
  fullName: string;
  assignedVenueIds: string[];
  membershipId?: string;
  roleId?: string;
};

export function CustomerModal({
  open,
  onOpenChange,
  mode,
  customer,
}: CustomerModalProps) {
  const inviteUserMutation = useInviteUser();
  const updateUserMutation = useUpdateUser();
  const { data: memberships, isLoading: isLoadingMemberships } =
    useMemberships();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CustomerFormData>({
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

  // Reset form when modal opens/closes or customer changes
  useEffect(() => {
    if (open) {
      if ((mode === "edit" || mode === "view") && customer) {
        setValue("fullName", customer.profile?.fullName || "");
        setValue("email", customer.email);
        setValue("userType", UserType.USER);
        setValue("assignedVenueIds", []);
        setValue("membershipId", customer.membershipId || "");
        setValue("roleId", "");
      } else {
        reset({
          fullName: "",
          email: "",
          userType: UserType.USER,
          assignedVenueIds: [],
          membershipId: "",
          roleId: "",
        });
      }
    }
  }, [open, mode, customer, setValue, reset]);

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (mode === "add") {
        await inviteUserMutation.mutateAsync({
          ...data,
          userType: UserType.USER,
        });
        onOpenChange(false);
      } else {
        if (!customer) return;
        const payload: UserUpdateData = {
          userId: customer.id,
          email: data.email,
          userType: UserType.USER,
          fullName: data.fullName,
          assignedVenueIds: [],
          membershipId: data.membershipId,
          roleId: "",
        };
        await updateUserMutation.mutateAsync(payload);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const isAddMode = mode === "add";
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view";
  const title = isAddMode
    ? "Invite New Customer"
    : isEditMode
      ? "Edit Customer"
      : "Customer Details";
  const description = isAddMode
    ? "Add a new customer to your YOLO Padel system. They'll receive an email invitation to join right away."
    : isEditMode
      ? "Update customer information."
      : "View customer information.";
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
