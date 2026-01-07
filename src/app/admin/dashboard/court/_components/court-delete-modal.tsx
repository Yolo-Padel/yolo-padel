"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useDeleteCourt } from "@/hooks/use-court";
import { toast } from "sonner";

type CourtDeleteModalProps = {
  deleteModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
  courtData?: {
    id: string;
    name: string;
    price: number;
  } | null;
  onSuccess?: () => void;
};

export function CourtDeleteModal({
  deleteModalOpen,
  onOpenChange,
  courtData,
  onSuccess,
}: CourtDeleteModalProps) {
  const deleteCourtMutation = useDeleteCourt();

  const handleDelete = async () => {
    if (!courtData?.id) return;

    try {
      await deleteCourtMutation.mutateAsync(courtData.id);
      toast.success("Court deleted successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error deleting court:", error);
      toast.error("Failed to delete court");
    }
  };

  return (
    <Dialog open={deleteModalOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[545px]" showCloseButton={false}>
        <div className="relative">
          <DialogHeader className="pr-8 gap-0">
            <DialogTitle className="text-xl font-semibold">
              Remove Court
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              Deleting this court will permanently remove all related booking
              history and availability settings. Make sure there are no active
              or upcoming bookings before continuing.
            </DialogDescription>
          </DialogHeader>

          <Button
            size="icon"
            className="absolute top-0 right-0 h-8 w-8 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-3 pt-4 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-primary text-gray-700 hover:bg-gray-50"
            disabled={deleteCourtMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
            onClick={handleDelete}
            disabled={deleteCourtMutation.isPending}
          >
            {deleteCourtMutation.isPending ? "Processing..." : "Delete Court"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
