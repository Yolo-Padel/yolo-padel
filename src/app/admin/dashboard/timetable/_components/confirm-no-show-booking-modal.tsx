"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConfirmNoShowBookingModal({
  open,
  onOpenChange,
  onMarkBookingAsNoShow,
  isLoading = false,
}: {
  open: boolean;
  onOpenChange:() => void;
  onMarkBookingAsNoShow: () => void;
  isLoading?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
        {/* Custom Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 size-8 rounded-full bg-[#C3D223] hover:bg-[#A9B920]"
          onClick={onOpenChange}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
        <div className="rounded-md">
          <DialogHeader className="pr-12">
            <DialogTitle className="text-2xl font-bold">
              <div className="flex flex-col gap-2">
                <span>Mark as No Show</span>
                <span className="text-sm text-muted-foreground font-normal">
                    The customer did not arrive for this booking. This cannot be undone.
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onOpenChange}
              className="flex-1 p-4 rounded-sm text-foreground border-[#C3D223]"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={onMarkBookingAsNoShow}
              className="flex-1 p-4 rounded-sm bg-[#C3D223] hover:bg-[#A9B920]"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Mark as No Show"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
