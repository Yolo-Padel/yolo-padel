"use client";

import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex h-[70px] items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-base font-normal text-muted-foreground">
            Manage your team members and their account permissions here.
          </p>
        </div>
        {/* <div className="flex gap-3 items-center">
          <Button
            variant="default"
            size="default"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Export
            <FileUp className="size-5" />
          </Button>
        </div> */}
      </div>
    </div>
  );
}
