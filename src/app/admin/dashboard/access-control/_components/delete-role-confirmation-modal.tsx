"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteRoleConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  roleName?: string;
  isDeleting?: boolean;
}

export function DeleteRoleConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  roleName,
  isDeleting = false,
}: DeleteRoleConfirmationModalProps) {
  const handleCancel = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Delete Role</DialogTitle>
          <DialogDescription>
            {roleName ? (
              <>
                Are you sure you want to delete the role{" "}
                <span className="font-semibold text-foreground">
                  &quot;{roleName}&quot;
                </span>
                ? This action cannot be undone.
              </>
            ) : (
              "Are you sure you want to delete this role? This action cannot be undone."
            )}
          </DialogDescription>
        </DialogHeader>

        <Button
          type="button"
          size="icon"
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground"
          onClick={handleCancel}
          disabled={isDeleting}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            className="flex-1 border border-primary bg-primary/20 font-medium text-sm hover:bg-primary/50"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 bg-brand text-brand-foreground font-medium text-sm hover:bg-brand/90 disabled:opacity-60"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
