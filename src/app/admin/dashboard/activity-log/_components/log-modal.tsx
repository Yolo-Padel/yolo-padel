"use client"

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { XIcon } from "lucide-react";
import { EntityType } from "@/types/entity";
import { ActionType } from "@/types/action";
import { Button } from "@/components/ui/button";
import { JsonValue } from "@prisma/client/runtime/library";

type LogDetailsProps = {
  date: Date;
  performedBy: string;
  role: string;
  module: EntityType;
  action: ActionType;
  reference: string;
  description: string | null;
  changes?: JsonValue;
}

export function LogDetails ({
  open,
  onOpenChange,
  logDetailsProps,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logDetailsProps: LogDetailsProps| null;
}) {
  return (
        <Dialog open={open} onOpenChange={onOpenChange} key={logDetailsProps?.reference}>
            <DialogContent showCloseButton={false} className="p-8">
            <div>
                <div className="flex flex-col gap-2">
                    <DialogTitle className="text-2xl font-normal"> Activity Details </DialogTitle>
                    <span className="text-muted-foreground"> Recorded activity for booking change by Admin </span>
                </div>
                <Button
                    className="absolute top-8 right-6 cursor-pointer bg-primary rounded-full"
                    onClick={() => onOpenChange(false)}>
                    <XIcon className="text-black" />
                </Button>
            </div>
            <div className="flex flex-col gap-2">
                <span className="text-foreground font-medium">Activity Overview</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col text-foreground">
                    <span>Date & Time</span>
                    <span>Performed By</span>
                    <span>Role</span>
                    <span>Action</span>
                    <span>Reference</span>
                    <span>Court</span>
                </div>
                <div className="flex flex-col text-foreground">
                    <span>{logDetailsProps?.date?.toLocaleString()}</span>
                    <span>{logDetailsProps?.performedBy}</span>
                    <span>{logDetailsProps?.role}</span>
                    <span>{logDetailsProps?.action}</span>
                    <span>{logDetailsProps?.reference}</span>
                    
                </div>
            </div>
            <div className="flex flex-col space-y-4">
                <span className="text-foreground font-medium">Log Description</span>
                <div className="flex flex-col p-4 border border-muted-foreground rounded-md">
                    <span className="text-foreground">{logDetailsProps?.description}</span>
                </div>
            </div>
            <div className="flex flex-col space-y-4">
                <span className="text-foreground font-medium">Affected Data</span>
                <div className="flex flex-col border border-muted rounded-md">
                    <div className="grid grid-cols-3 border-bottom bg-muted text-foreground p-4">
                        <span>Property</span>
                        <span>Before</span>
                        <span>After</span>
                    </div>
                <div className="flex flex-col text-foreground p-4 gap-3">
                    <div className="grid grid-cols-3 items-center">
                        <span>Time Slot</span>
                        <span>19:00 - 19:20</span>
                        <span>19:20 - 20:20</span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                        <span>Court</span>
                        <span>Court 3</span>
                        <span>Court 3</span>
                    </div>
                </div>
            </div>
            </div>
            </DialogContent>
        </Dialog>
    
  );
}
