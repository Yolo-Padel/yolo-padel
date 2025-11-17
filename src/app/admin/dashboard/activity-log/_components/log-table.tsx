"use client"

import React from "react"
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
} from "lucide-react";
import { User, Profile, Role, UserStatus, ActivityLog } from "@/types/prisma";
import { useActivityLogsAdmin } from "@/hooks/use-activity-log";

const PAGE_SIZE = 10;

export function ActivityLogTable() {
  const { data, isLoading, error } = useActivityLogsAdmin();
  const allLogs = data?.data || [];

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
            <TableHead>Detail</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allLogs.map((log: ActivityLog & { user: User & { profile: Profile } }) => (
            <TableRow key={log.id}>
              <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
              <TableCell><span className="text-sm font-medium">{log.user?.profile?.fullName}</span> <br/> <span className="text-xs text-muted-foreground">{log.user?.email}</span></TableCell>
              <TableCell>{log.user?.role}</TableCell>
              <TableCell>{log.entityType}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell>{log.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
