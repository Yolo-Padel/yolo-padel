"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CourtHeaderProps {
  courtCount: number;
  canCreateCourt: boolean;
  onAddCourt: () => void;
}

export function CourtHeader({
  courtCount,
  canCreateCourt,
  onAddCourt,
}: CourtHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-semibold">Court List</h2>
        <Badge className="text-[#6941C6] bg-[#F9F5FF] border-[#E9D7FE] shadow-none rounded-4xl">
          {courtCount} courts
        </Badge>
      </div>
      {canCreateCourt && (
        <Button
          onClick={onAddCourt}
          className="bg-brand text-brand-foreground hover:bg-brand/90"
        >
          Add Court
          <Plus className="ml-2 size-4" />
        </Button>
      )}
    </div>
  );
}
