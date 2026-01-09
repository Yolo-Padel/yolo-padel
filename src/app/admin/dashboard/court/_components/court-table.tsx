"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { stringUtils } from "@/lib/format/string";
import { cn } from "@/lib/utils";
import {
  Pencil,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash,
  Eye,
} from "lucide-react";
import { generatePageNumbers } from "@/lib/pagination-utils";
import { OpeningHoursType } from "@/types/prisma";

// ════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════

export type Court = {
  id: string;
  courtName: string;
  status: string;
  pricePerHour: number;
  availability: boolean;
  availabilityTime: string;
  image?: string;
  openingHours?: OpeningHoursType;
  operatingHours?: Array<{
    id: string;
    dayOfWeek: string;
    closed: boolean;
    slots: Array<{
      id: string;
      openHour: string;
      closeHour: string;
    }>;
  }>;
  ayoFieldId?: number | null;
};

export interface PaginationInfo {
  pageSafe: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface CourtTableProps {
  courts: Court[];
  paginationInfo: PaginationInfo;
  canUpdateCourt: boolean;
  canDeleteCourt: boolean;
  isToggling: boolean;
  onPageChange: (page: number) => void;
  onEditCourt: (court: Court) => void;
  onViewCourt: (court: Court) => void;
  onDeleteCourt: (court: Court) => void;
  onToggleAvailability: (courtId: string, checked: boolean) => void;
}

// ════════════════════════════════════════════════════════
// Constants
// ════════════════════════════════════════════════════════

const COLUMNS = [
  "Court Name",
  "Status",
  "Price (Hour)",
  "Availability",
  "Availability Time",
  "Actions",
];

const paginationButtonBaseClass =
  "w-8 h-8 p-0 bg-[#FAFAFA] border border-[#E9EAEB] text-[#A4A7AE] hover:bg-[#E9EAEB]";
const paginationButtonActiveClass =
  "bg-brand border-brand hover:bg-brand/90 text-brand-foreground";

// ════════════════════════════════════════════════════════
// Helper Functions
// ════════════════════════════════════════════════════════

function getStatusColor(status: string): string {
  switch (status) {
    case "Available":
      return "bg-green-500";
    case "Booked":
      return "bg-red-500";
    case "Maintenance":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
}

// ════════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════════

export function CourtTable({
  courts,
  paginationInfo,
  canUpdateCourt,
  canDeleteCourt,
  isToggling,
  onPageChange,
  onEditCourt,
  onViewCourt,
  onDeleteCourt,
  onToggleAvailability,
}: CourtTableProps) {
  return (
    <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="h-11">Court Name</TableHead>
            <TableHead className="h-11">Status</TableHead>
            <TableHead className="h-11">Price (Hour)</TableHead>
            <TableHead className="h-11">Availability</TableHead>
            <TableHead className="h-11">Availability Time</TableHead>
            <TableHead className="h-11 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courts.map((court) => (
            <TableRow key={court.id}>
              <TableCell className="font-medium">{court.courtName}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(court.status)}`}
                    />
                    {court.status}
                  </div>
                </Badge>
              </TableCell>
              <TableCell>
                <span>{stringUtils.formatRupiah(court.pricePerHour)}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={court.availability}
                    disabled={isToggling}
                    onCheckedChange={(checked: boolean) => {
                      onToggleAvailability(court.id, checked);
                    }}
                    className="data-[state=checked]:bg-brand"
                  />
                </div>
              </TableCell>
              <TableCell className="max-w-[200px] overflow-hidden text-ellipsis text-xs">
                {court.availabilityTime}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      canUpdateCourt ? onEditCourt(court) : onViewCourt(court)
                    }
                    className="border-none shadow-none"
                  >
                    {canUpdateCourt ? (
                      <Pencil className="size-4 text-[#A4A7AE]" />
                    ) : (
                      <Eye className="size-4 text-[#A4A7AE]" />
                    )}
                  </Button>
                  {canDeleteCourt && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteCourt(court)}
                      className="border-none shadow-none"
                    >
                      <Trash className="size-4 text-[#A4A7AE]" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={COLUMNS.length} className="p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!paginationInfo.hasPreviousPage}
                  onClick={() =>
                    onPageChange(Math.max(1, paginationInfo.pageSafe - 1))
                  }
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {generatePageNumbers(
                    paginationInfo.pageSafe,
                    paginationInfo.totalPages,
                  ).map((pageNum, index) => (
                    <div key={index}>
                      {pageNum === "..." ? (
                        <div className="flex items-center justify-center w-8 h-8 bg-background border border-[#E9EAEB] text-[#A4A7AE]">
                          <MoreHorizontal className="w-4 h-4" />
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPageChange(pageNum as number)}
                          className={cn(
                            paginationButtonBaseClass,
                            pageNum === paginationInfo.pageSafe &&
                              paginationButtonActiveClass,
                          )}
                        >
                          {pageNum}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!paginationInfo.hasNextPage}
                  onClick={() =>
                    onPageChange(
                      Math.min(
                        paginationInfo.totalPages,
                        paginationInfo.pageSafe + 1,
                      ),
                    )
                  }
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
