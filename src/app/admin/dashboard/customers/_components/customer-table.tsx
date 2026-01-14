"use client";

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
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash,
  Eye,
} from "lucide-react";
import { User, Profile, UserStatus, Membership } from "@/types/prisma";
import { generatePageNumbers } from "@/lib/pagination-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface PaginationInfo {
  pageSafe: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  total: number;
}

export interface CustomerTableProps {
  customers: (User & {
    profile?: Profile | null;
    membership?: Membership | null;
    invitation?: {
      state: "valid" | "expired" | "used" | "none";
      expiresAt?: string;
    };
  })[];
  paginationInfo: PaginationInfo;
  onPageChange: (page: number) => void;
  onEditCustomer: (customer: User & { profile?: Profile | null }) => void;
  onDeleteCustomer: (customer: User & { profile?: Profile | null }) => void;
  canDeleteCustomer: boolean;
  canEditCustomer: boolean;
  isPermissionLoading: boolean;
}

export function CustomerTable({
  customers,
  paginationInfo,
  onPageChange,
  onEditCustomer,
  onDeleteCustomer,
  canDeleteCustomer,
  canEditCustomer,
  isPermissionLoading,
}: CustomerTableProps) {
  // Define table columns for colSpan
  const columns = ["Profile", "Status", "Membership", "Join Date", "Actions"];

  const paginationButtonBaseClass =
    "w-8 h-8 p-0 bg-[#FAFAFA] border border-[#E9EAEB] text-[#A4A7AE] hover:bg-[#E9EAEB]";
  const paginationButtonActiveClass =
    "bg-brand border-brand hover:bg-brand/90 text-brand-foreground";

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case UserStatus.JOINED:
        return (
          <Badge variant="outline">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" /> Joined
            </div>
          </Badge>
        );
      case UserStatus.INVITED:
        return (
          <Badge variant="outline">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" /> Invited
            </div>
          </Badge>
        );
    }
  };

  const renderStatusBadge = (
    customer: User & { profile?: Profile | null } & {
      invitation?: {
        state: "valid" | "expired" | "used" | "none";
        expiresAt?: string;
      };
    },
  ) => {
    if (customer.userStatus !== UserStatus.INVITED)
      return getStatusBadge(customer.userStatus);
    const state = customer.invitation?.state || "none";

    return (
      <Badge variant="outline">
        <div className="flex items-center gap-2">
          {state === "expired" ? (
            <>
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Link Expired</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>Invited (Sent)</span>
            </>
          )}
        </div>
      </Badge>
    );
  };

  return (
    <>
      <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-11">Profile</TableHead>
              <TableHead className="h-11">Status</TableHead>
              <TableHead className="h-11">Membership</TableHead>
              <TableHead className="h-11">Join Date</TableHead>
              <TableHead className="h-11 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => {
              return (
                <TableRow key={c.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={c.profile?.avatar || ""} />
                      <AvatarFallback className="uppercase">
                        {c.profile?.fullName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{c.profile?.fullName}</span>
                      <span className="text-muted-foreground">{c.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {renderStatusBadge(c)}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.membership
                      ? `${c.membership.name} Member`
                      : "Non-member"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.joinDate
                      ? new Date(c.joinDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {canDeleteCustomer && !isPermissionLoading && (
                      <Button
                        variant="outline"
                        onClick={() => onDeleteCustomer(c)}
                        className="border-none shadow-none"
                      >
                        <Trash className="size-4 text-[#A4A7AE]" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => onEditCustomer(c)}
                      className="border-none shadow-none"
                    >
                      {canEditCustomer ? (
                        <Pencil className="size-4 text-[#A4A7AE]" />
                      ) : (
                        <Eye className="size-4 text-[#A4A7AE]" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter className="bg-transparent">
            <TableRow>
              <TableCell colSpan={columns.length} className="p-4">
                <div className="flex items-center justify-between">
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
      </div>
    </>
  );
}
