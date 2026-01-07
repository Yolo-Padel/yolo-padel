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
import { useDeleteVenue } from "@/hooks/use-venue";
import { VenueDeleteData } from "@/lib/validations/venue.validation";
import { toast } from "sonner";

type VenueDeleteModalProps = {
  deleteSheetOpen: boolean;
  onOpenChange: (open: boolean) => void;
  venueData?: {
    id: string;
    name: string;
    address?: string;
  } | null;
  onSuccess?: () => void;
};

export function DeleteVenue({
  deleteSheetOpen,
  onOpenChange,
  venueData,
  onSuccess,
}: VenueDeleteModalProps) {
  const deleteVenueMutation = useDeleteVenue();

  const handleDelete = async () => {
    if (!venueData?.id) return;

    try {
      const deleteData: VenueDeleteData = { venueId: venueData.id };
      await deleteVenueMutation.mutateAsync(deleteData);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error deleting venue:", error);
    }
  };

  return (
    <Dialog open={deleteSheetOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[545px]" showCloseButton={false}>
        <div className="relative">
          <DialogHeader className="pr-8 gap-0">
            <DialogTitle className="text-xl font-semibold">
              Remove Venue
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              Are you sure you want to remove <b>{venueData?.name}</b> from the
              system? This will permanently delete the venue and all related
              courts, bookings, and reports. Please make sure there are no
              pending bookings before you continue.
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
            disabled={deleteVenueMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
            onClick={handleDelete}
            disabled={deleteVenueMutation.isPending}
          >
            {deleteVenueMutation.isPending ? "Processing..." : "Delete Venue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
