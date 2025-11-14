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
import { User, Profile, Role, UserStatus } from "@/types/prisma";


const PAGE_SIZE = 10;

export function ActivityLogTable() {
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
          <TableRow>
            <TableCell>2023-01-01 10:00:00</TableCell>
            <TableCell><span className="text-sm font-medium">Regina</span> <br/> <span className="text-xs text-muted-foreground">reginapacis@example.com</span></TableCell>
            <TableCell>Admin Slipi</TableCell>
            <TableCell>Booking Management</TableCell>
            <TableCell>Update</TableCell>
            <TableCell>Changed booking time ID #B-132 (Court 3, 18:00 → 19:00 PM).</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
