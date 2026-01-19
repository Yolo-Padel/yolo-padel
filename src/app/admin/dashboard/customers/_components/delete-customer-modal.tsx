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
import { X } from "lucide-react";
import { User, Profile } from "@/types/prisma";
import { useDeleteUser } from "@/hooks/use-users";
import {
  userDeleteSchema,
  UserDeleteData,
} from "@/lib/validations/user.validation";

interface DeleteCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: User & { profile?: Profile | null };
}

export function DeleteCustomerModal({
  open,
  onOpenChange,
  customer,
}: DeleteCustomerModalProps) {
  const deleteUserMutation = useDeleteUser();

  const {
    formState: { errors, isSubmitting },
    reset,
    setValue,
    handleSubmit,
  } = useForm<UserDeleteData>({
    resolver: zodResolver(userDeleteSchema),
    defaultValues: {
      userId: customer?.id || "",
    },
  });

  // Reset form when modal opens/closes or customer changes
  useEffect(() => {
    if (open) {
      if (customer) {
        setValue("userId", customer.id);
      } else {
        reset({
          userId: "",
        });
      }
    }
  }, [open, customer, setValue, reset]);

  const onSubmit = async (data: UserDeleteData) => {
    try {
      if (customer) {
        await deleteUserMutation.mutateAsync(data);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Delete customer error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[545px]" showCloseButton={false}>
        <div className="relative">
          <DialogHeader className="pr-8 gap-0">
            <DialogTitle className="text-xl font-semibold">
              Remove Customer
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              Are you sure you want to remove{" "}
              <b>{customer?.profile?.fullName}</b> from the system? They won't
              be able to log in anymore, but their data (bookings, orders, and
              payment history) will still be stored for record purposes.
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

        <form onSubmit={handleSubmit(onSubmit)}>
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
              className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Delete Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
