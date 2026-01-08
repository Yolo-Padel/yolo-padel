"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-profile";
import { profileUpdateSchema } from "@/lib/validations/profile.validation";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { UserType, Profile } from "@/types/prisma";
import { NextBookingInfo } from "@/types/profile";
import { AvatarUploader } from "@/app/_components/avatar-uploader";
import { Separator } from "@/components/ui/separator";

type ProfileStatus = "active" | "member" | "non-member";
type ExtendedProfile = Profile & { phoneNumber?: string | null };

interface ProfileModalProps {
  /**
   * Kontrol apakah modal terbuka atau tidak
   */
  open: boolean;
  /**
   * Callback ketika state open berubah
   */
  onOpenChange: (open: boolean) => void;
}

/**
 * ProfileModal Component
 *
 * Menampilkan informasi profil pengguna serta form untuk memperbarui data.
 */
export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { user, profile, nextBooking, isLoading, membership, venues, roles } =
    useAuth();
  const updateProfileMutation = useUpdateProfile();

  const formSchema = profileUpdateSchema;
  type FormData = z.infer<typeof formSchema>;

  const defaultValues = useMemo(() => {
    const extendedProfile = profile as ExtendedProfile | null;
    return {
      fullName: extendedProfile?.fullName ?? "",
      phoneNumber: extendedProfile?.phoneNumber ?? "",
      avatar: extendedProfile?.avatar ?? undefined,
    };
  }, [profile]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const derivedUserType =
    user?.userType && user.userType !== UserType.USER ? "staff" : "user";
  const profileStatus: ProfileStatus =
    derivedUserType === "staff"
      ? "active"
      : membership
        ? "member"
        : "non-member";
  const description =
    derivedUserType === "staff"
      ? "Manage your personal information."
      : "View all information related to your booking.";

  const badgeConfig = getBadgeConfig(profileStatus);
  const fullName = form.watch("fullName") || user?.email || "User";
  const initials = getInitials(fullName);
  const avatarValue = form.watch("avatar");
  const email = user?.email ?? "user@example.com";
  const assignedVenuesLabel =
    user && Array.isArray(user.assignedVenueIds) && user.assignedVenueIds.length
      ? venues?.map((venue) => venue.name).join(", ")
      : "-";
  const joinedDateLabel = formatDateLabel(user?.joinDate || null);
  const nextBookingLabel = formatNextBookingLabel(nextBooking);

  const infoItems =
    derivedUserType === "staff"
      ? [
          {
            label: "Role",
            value: roles?.name ?? "Staff",
          },
          { label: "Assign Venue", value: assignedVenuesLabel },
          { label: "Joined", value: joinedDateLabel },
        ]
      : membership
        ? [
            { label: "Membership", value: membership.name },
            { label: "Next Booking", value: nextBookingLabel },
            { label: "Joined", value: joinedDateLabel },
          ]
        : [
            { label: "Next Booking", value: nextBookingLabel },
            { label: "Joined", value: joinedDateLabel },
          ];

  const handleAvatarChange = (url: string) => {
    form.setValue("avatar", url || undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = (data: FormData) => {
    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        form.reset(data);
      },
    });
  };

  const handleCancel = () => {
    form.reset(defaultValues);
    onOpenChange(false);
  };

  const isSaving = updateProfileMutation.isPending;
  const canSubmit =
    form.formState.isValid && form.formState.isDirty && !isSaving;

  if (!user && !isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTitle className="sr-only">My Profile</DialogTitle>
        <DialogContent className="max-w-[600px] rounded-xl bg-white">
          <p className="text-sm text-muted-foreground">
            Unable to load profile information.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">My Profile</DialogTitle>
      <DialogContent
        showCloseButton={false}
        className="max-w-[600px] max-h-[80vh] gap-0 rounded-xl overflow-hidden bg-white flex flex-col"
      >
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 bg-white flex items-start justify-between w-full border-b border-border/40">
          <div className="flex flex-col gap-[10px] flex-1">
            <h1 className="text-[24px] font-bold leading-normal text-[#262626]">
              My Profile
            </h1>
            <p className="text-[14px] font-medium leading-normal text-[#7b7b7b]">
              {description}
            </p>
          </div>
          <Button
            onClick={() => onOpenChange(false)}
            className="relative shrink-0 size-8 cursor-pointer h-8 w-8 rounded-full bg-brand hover:bg-brand/90 text-white"
            aria-label="Close profile modal"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto py-2">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full">
              {/* Avatar and User Info */}
              <div className="flex flex-col gap-3 w-full">
                <AvatarUploader
                  value={avatarValue || profile?.avatar || ""}
                  initials={initials}
                  name={fullName}
                  folderPath={`profiles/${user?.id ?? "shared"}`}
                  disabled={isSaving}
                  onChange={handleAvatarChange}
                />
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2 items-center flex-wrap">
                    <p className="text-[18px] font-semibold leading-normal text-[#262626]">
                      {fullName}
                    </p>
                    {badgeConfig && (
                      <Badge
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-[6px]",
                          badgeConfig.className,
                        )}
                      >
                        {badgeConfig.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[12px] font-normal leading-normal text-[#a3a3a3]">
                    {email}
                  </p>
                </div>
              </div>

              {/* Info Section */}
              <div className="flex items-start gap-4 w-full">
                {infoItems.map((item, index) => (
                  <div key={item.label} className="flex flex-row gap-3 h-full">
                    <div key={item.label} className="flex flex-col gap-1">
                      <p
                        className="text-[14px] font-normal text-[#7b7b7b] truncate"
                        title={item.label}
                      >
                        {item.label}
                      </p>
                      <p
                        className="text-[14px] font-medium text-[#262626] overflow-wrap"
                        title={item.value}
                      >
                        {item.value}
                      </p>
                    </div>
                    {index < infoItems.length - 1 && (
                      <Separator orientation="vertical" className="!h-auto" />
                    )}
                  </div>
                ))}
              </div>

              {/* Form */}
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col w-full"
              >
                <FieldGroup className="gap-2">
                  <Field className="gap-1">
                    <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                    <Input
                      id="fullName"
                      placeholder="Full name"
                      {...form.register("fullName")}
                      className="h-9"
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-destructive text-sm">
                        {form.formState.errors.fullName.message}
                      </p>
                    )}
                  </Field>

                  <Field className="gap-1">
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      value={email}
                      type="email"
                      disabled
                      className="bg-[#f4f4f5] border-[#e5e7eb] text-[#a1a1aa] h-9 cursor-not-allowed"
                    />
                  </Field>

                  <Field className="gap-1">
                    <FieldLabel htmlFor="phoneNumber">Phone number</FieldLabel>
                    <Input
                      id="phoneNumber"
                      placeholder="+62 ..."
                      {...form.register("phoneNumber")}
                      className="h-9"
                    />
                    {form.formState.errors.phoneNumber && (
                      <p className="text-destructive text-sm">
                        {form.formState.errors.phoneNumber.message}
                      </p>
                    )}
                  </Field>
                </FieldGroup>
              </form>
            </div>
          )}
        </div>

        {/* Action Buttons - Sticky */}
        <div className="sticky bottom-0 z-10 bg-white flex gap-4 w-full border-t border-border/40">
          <Button
            type="button"
            onClick={handleCancel}
            className="flex-1 h-10 border border-primary bg-primary/20 font-medium text-sm hover:bg-primary/50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={!canSubmit}
            className="flex-1 h-10 bg-brand text-brand-foreground font-medium text-sm hover:bg-brand/90 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getBadgeConfig(status: ProfileStatus) {
  switch (status) {
    case "active":
      return {
        label: "Joined",
        className: "bg-[#d0fbe9] text-[#1a7544] border-transparent",
      };
    case "member":
      return {
        label: "Member",
        className: "bg-[#d5f1ff] text-[#1f7ead] border-transparent",
      };
    case "non-member":
    default:
      return {
        label: "Non-member",
        className: "bg-[#f2f5f8] text-[#222530] border-transparent",
      };
  }
}

function formatDateLabel(value: Date | string | null) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatNextBookingLabel(info?: NextBookingInfo | null) {
  if (!info) return "No upcoming booking.";

  const date = new Date(info.bookingDate);
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const dateLabel = isToday
    ? "Today"
    : new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
      }).format(date);

  const slots = info.timeSlots[0].openHour;

  const locationLabel = [info.courtName, info.venueName]
    .filter(Boolean)
    .join(" - ");

  return [
    dateLabel,
    slots ? `at ${slots}` : null,
    locationLabel ? locationLabel : null,
  ]
    .filter(Boolean)
    .join(" ");
}
