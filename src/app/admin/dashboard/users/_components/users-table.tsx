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
} from "lucide-react";
import {
  User,
  Profile,
  UserType,
  UserStatus,
  Membership,
  Roles,
} from "@/types/prisma";
import { generatePageNumbers } from "@/lib/pagination-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ResendInviteButton } from "@/app/admin/dashboard/users/_components/resend-invite-button";
import { stringUtils } from "@/lib/format/string";
import { cn } from "@/lib/utils";

export interface PaginationInfo {
  pageSafe: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  total: number;
}

export interface UsersTableProps {
  users: (User & {
    profile?: Profile | null;
    membership?: Membership | null;
    roles?: Roles | null;
    invitation?: {
      state: "valid" | "expired" | "used" | "none";
      expiresAt?: string;
    };
  })[];
  paginationInfo: PaginationInfo;
  onPageChange: (page: number) => void;
  onEditUser: (user: User & { profile?: Profile | null }) => void;
  onDeleteUser: (user: User & { profile?: Profile | null }) => void;
}

export function UsersTable({
  users,
  paginationInfo,
  onPageChange,
  onEditUser,
  onDeleteUser,
}: UsersTableProps) {
  // Define table columns for colSpan
  const columns = [
    "Profile",
    "Status",
    "Assigned Role",
    "Membership",
    "Join Date",
    "Actions",
  ];

  const paginationButtonBaseClass =
    "w-8 h-8 p-0 bg-[#FAFAFA] border border-[#E9EAEB] text-[#A4A7AE] hover:bg-[#E9EAEB]";
  const paginationButtonActiveClass =
    "bg-primary border-primary hover:bg-primary text-black";

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return (
          <Badge variant="outline">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" /> Active
            </div>
          </Badge>
        );
      case UserStatus.INACTIVE:
        return (
          <Badge variant="outline">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" /> Inactive
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
    user: User & { profile?: Profile | null } & {
      invitation?: {
        state: "valid" | "expired" | "used" | "none";
        expiresAt?: string;
      };
    }
  ) => {
    if (user.userStatus !== UserStatus.INVITED)
      return getStatusBadge(user.userStatus);
    const state = user.invitation?.state || "none";

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

  const getAssignedRole = (user: User & { roles?: Roles | null }) => {
    // Jika USER biasa, tidak ada assigned role
    if (user.userType === UserType.USER) return "-";

    // Jika ADMIN atau STAFF, tampilkan role name dari relasi roles
    return user.roles?.name || "-";
  };

  return (
    <>
      <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-11">Profile</TableHead>
              <TableHead className="h-11">Status</TableHead>
              <TableHead className="h-11">Assigned Role</TableHead>
              <TableHead className="h-11">Membership</TableHead>
              <TableHead className="h-11">Join Date</TableHead>
              <TableHead className="h-11 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              return (
                <TableRow key={u.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={u.profile?.avatar || ""} />
                      <AvatarFallback className="uppercase">
                        {u.profile?.fullName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{u.profile?.fullName}</span>
                      <span className="text-muted-foreground">{u.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {renderStatusBadge(u)}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getAssignedRole(u)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.userType !== UserType.USER
                      ? "Staff"
                      : u.membership
                        ? `${u.membership.name} Member`
                        : "Non-member"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.joinDate
                      ? new Date(u.joinDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      onClick={() => onDeleteUser(u)}
                      className="border-none shadow-none"
                    >
                      <Trash className="size-4 text-[#A4A7AE]" />
                    </Button>
                    {u.userStatus === UserStatus.INVITED ? (
                      <ResendInviteButton userId={u.id} />
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => onEditUser(u)}
                        className="border-none shadow-none"
                      >
                        <Pencil className="size-4 text-[#A4A7AE]" />
                      </Button>
                    )}
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
