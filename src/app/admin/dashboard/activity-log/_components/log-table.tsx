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
} from "@/components/ui/table";
import { Eye } from "lucide-react";
import { User, Profile, ActivityLog } from "@/types/prisma";
import { useActivityLogsAdmin } from "@/hooks/use-activity-log";
import { LogDetails } from "./log-modal";
import { ActionType } from "@/types/action";
import { EntityType } from "@/types/entity";
import { stringUtils } from "@/lib/format/string";
import { ActivityLogTableSkeleton } from "./log-table-skeleton";
import { ActivityLogEmptyState } from "./log-empty-state";

export function ActivityLogTable() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading, error } = useActivityLogsAdmin();
  const allLogs = data?.data || [];
  const [selectedLog, setSelectedLog] = useState<
    (ActivityLog & { user: User & { profile: Profile } }) | null
  >(null);

  if (isLoading) return <ActivityLogTableSkeleton />;
  if (error)
    return (
      <div className="rounded-2xl border border-[#E9EAEB] p-8 text-center text-red-600">
        Error loading logs: {error.message}
      </div>
    );
  if (!data || allLogs.length === 0) {
    return <ActivityLogEmptyState />;
  }

  return (
    <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date&Time</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Modul</TableHead>
            <TableHead>Action</TableHead>
            {/* <TableHead>Detail</TableHead> */}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allLogs.map(
            (log: ActivityLog & { user: User & { profile: Profile } }) => (
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
                    {log.user?.profile?.fullName}
                  </span>{" "}
                  <br />{" "}
                  <span className="text-xs text-muted-foreground">
                    {log.user?.email}
                  </span>
                </TableCell>
                <TableCell>
                  {stringUtils.toTitleCase(log.user?.userType)}
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
                    onClick={() => {
                      setSelectedLog(log);
                      setModalOpen(true);
                    }}
                  >
                    <Eye className="size-4 text-[#A4A7AE]" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
        {/*Log Details Modal*/}
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
      </Table>
    </div>
  );
}
