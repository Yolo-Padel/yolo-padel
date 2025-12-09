"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { Eye, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { LogDetails } from "./log-modal";
import { ActionType } from "@/types/action";
import { EntityType } from "@/types/entity";
import { stringUtils } from "@/lib/format/string";
import { generatePageNumbers } from "@/lib/pagination-utils";
import { cn } from "@/lib/utils";
import { type ActivityLogWithUser } from "@/hooks/use-activity-log";

// ════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════

/**
 * Pagination information for the table
 * Requirements: 5.2, 5.4, 5.5
 */
export interface ActivityLogPaginationInfo {
  pageSafe: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Props for the ActivityLogTable component
 * Requirements: 5.2, 5.4, 5.5, 8.5
 */
export interface ActivityLogTableProps {
  /** Array of activity logs to display */
  logs: ActivityLogWithUser[];
  /** Pagination information */
  paginationInfo: ActivityLogPaginationInfo;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when viewing a log's details */
  onViewLog: (log: ActivityLogWithUser) => void;
}

// ════════════════════════════════════════════════════════
// Component
// ════════════════════════════════════════════════════════

/**
 * Pure presentation component for displaying activity logs in a table
 *
 * This component:
 * - Receives logs data as props (no internal data fetching)
 * - Receives pagination info as props
 * - Emits events via callbacks (onPageChange, onViewLog)
 * - Includes pagination controls in table footer
 *
 * Requirements: 5.2, 5.4, 5.5, 8.5
 */
export function ActivityLogTable({
  logs,
  paginationInfo,
  onPageChange,
  onViewLog,
}: ActivityLogTableProps) {
  // Local UI state for modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLogWithUser | null>(
    null
  );

  // Pagination button styles (consistent with OrderTable)
  const paginationButtonBaseClass =
    "w-8 h-8 p-0 bg-[#FAFAFA] border border-[#E9EAEB] text-[#A4A7AE] hover:bg-[#E9EAEB]";
  const paginationButtonActiveClass =
    "bg-primary text-black border-primary hover:bg-primary";

  /**
   * Handle view button click
   * Opens modal and notifies parent
   */
  const handleViewClick = (log: ActivityLogWithUser) => {
    setSelectedLog(log);
    setModalOpen(true);
    onViewLog(log);
  };

  return (
    <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="h-11">Date&Time</TableHead>
            <TableHead className="h-11">Name</TableHead>
            <TableHead className="h-11">Role</TableHead>
            <TableHead className="h-11">Modul</TableHead>
            <TableHead className="h-11">Action</TableHead>
            <TableHead className="h-11">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {new Date(log.createdAt).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium">
                  {log.user?.profile?.fullName || "-"}
                </span>
                <br />
                <span className="text-xs text-muted-foreground">
                  {log.user?.email || "-"}
                </span>
              </TableCell>
              <TableCell>
                {stringUtils.toTitleCase(log.user?.userType || "-")}
              </TableCell>
              <TableCell>{log.entityType}</TableCell>
              <TableCell>
                {stringUtils.toTitleCase(log.action.split("_")[0])}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-none shadow-none"
                  onClick={() => handleViewClick(log)}
                >
                  <Eye className="size-4 text-[#A4A7AE]" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        {/* Pagination Footer - Requirements: 5.2, 5.4, 5.5 */}
        <TableFooter className="bg-transparent">
          <TableRow>
            <TableCell colSpan={6} className="p-4">
              <div className="flex items-center justify-between">
                {/* Previous Button - Requirement 5.4 */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!paginationInfo.hasPreviousPage}
                  onClick={() => onPageChange(paginationInfo.pageSafe - 1)}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {generatePageNumbers(
                    paginationInfo.pageSafe,
                    paginationInfo.totalPages
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
                              paginationButtonActiveClass
                          )}
                        >
                          {pageNum}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Next Button - Requirement 5.5 */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!paginationInfo.hasNextPage}
                  onClick={() => onPageChange(paginationInfo.pageSafe + 1)}
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

      {/* Log Details Modal */}
      <LogDetails
        open={modalOpen}
        onOpenChange={setModalOpen}
        logDetailsProps={{
          date: new Date(selectedLog?.createdAt || ""),
          performedBy: selectedLog?.user?.profile?.fullName || "",
          role: selectedLog?.user?.userType || "",
          module: selectedLog?.entityType as EntityType,
          action: selectedLog?.action as ActionType,
          reference: selectedLog?.entityId || "",
          description: selectedLog?.description || "",
          changes: selectedLog?.changes || null,
        }}
      />
    </div>
  );
}
