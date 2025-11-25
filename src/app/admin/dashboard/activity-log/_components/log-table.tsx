"use client";

import React from "react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import {
  Pencil,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash,
  Eye,
} from "lucide-react";
import {
  User,
  Profile,
  UserType,
  UserStatus,
  ActivityLog,
} from "@/types/prisma";
import { useActivityLogsAdmin } from "@/hooks/use-activity-log";
import { LogDetails } from "./log-modal";
import { ActionType } from "@/types/action";
import { EntityType } from "@/types/entity";
import { date } from "zod/v3";
import { JsonValue } from "@prisma/client/runtime/library";
import { stringUtils } from "@/lib/format/string";

const PAGE_SIZE = 10;

export function ActivityLogTable() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading, error } = useActivityLogsAdmin();
  const allLogs = data?.data || [];
  const [selectedLog, setSelectedLog] = useState<
    (ActivityLog & { user: User & { profile: Profile } }) | null
  >(null);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No activity logs found.</div>;

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
