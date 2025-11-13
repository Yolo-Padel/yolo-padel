"use client";

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
import { UsersEditSheet } from "@/app/admin/dashboard/users/_components/users-edit-sheet";
import { UsersTableLoading } from "@/app/admin/dashboard/users/_components/users-table-loading";
import { UserModal } from "@/app/admin/dashboard/users/_components/user-modal";
import { DeleteUserModal } from "@/app/admin/dashboard/users/_components/delete-user-modal";
import { useUsers } from "@/hooks/use-users";
import { User, Profile, Role, UserStatus } from "@/types/prisma";
import {
  generatePageNumbers,
  calculatePaginationInfo,
  getPaginatedData,
} from "@/lib/pagination-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ResendInviteButton } from "@/app/admin/dashboard/users/_components/resend-invite-button";

const PAGE_SIZE = 10;

export function UsersTable() {
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<
    (User & { profile?: Profile | null }) | null
  >(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<
    (User & { profile?: Profile | null }) | null
  >(null);

  // Define table columns for colSpan
  const columns = [
    "Name",
    "Email",
    "Role",
    "Status",
    "Email Verified",
    "Created",
    "Actions",
  ];

  // Fetch users data
  const { data, isLoading, error } = useUsers();

  const allUsers = data?.data?.users || [];

  // Frontend filtering and pagination
  const filtered = useMemo(() => {
    return allUsers;
  }, [allUsers]);

  const paginationInfo = useMemo(
    () => calculatePaginationInfo(page, filtered.length, PAGE_SIZE),
    [page, filtered.length]
  );

  const paginated = useMemo(
    () => getPaginatedData(filtered, page, PAGE_SIZE),
    [filtered, page]
  );

  async function handleSubmit() {
    // Dummy submit: console log value
    console.log("");
  }

  // Show loading state
  if (isLoading) {
    return <UsersTableLoading />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center py-8">
          <p className="text-destructive">
            Failed to load users: {error.message}
          </p>
        </div>
      </div>
    );
  }

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

  const getRole = (role: Role) => {
    switch (role) {
      case Role.SUPER_ADMIN:
        return "Super Admin";
      case Role.ADMIN:
        return "Admin";
      case Role.USER:
        return "User";
      case Role.FINANCE:
        return "Finance";
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">User List</h2>
          <Badge className="text-[#6941C6] bg-[#F9F5FF] border-[#E9D7FE] shadow-none rounded-4xl">
            {allUsers.length} users
          </Badge>
        </div>
        <Button
          onClick={() => {
            setModalMode("add");
            setModalOpen(true);
          }}
          className="text-black"
        >
          Add User
          <Plus className="ml-0 size-4" />
        </Button>
      </div>
      <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-11">Name</TableHead>
              <TableHead className="h-11">Status</TableHead>
              <TableHead className="h-11">Role</TableHead>
              <TableHead className="h-11">Email address</TableHead>
              <TableHead className="h-11">Join Date</TableHead>
              <TableHead className="h-11 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((u: User & { profile?: Profile | null }) => {
              return (
                <TableRow key={u.id}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={u.profile?.avatar || ""} />
                      <AvatarFallback className="uppercase">
                        {u.profile?.fullName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {u.profile?.fullName || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {renderStatusBadge(u as any)}
                      <ResendInviteButton userId={u.id} status={u.userStatus} />
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getRole(u.role)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.joinDate
                      ? new Date(u.joinDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Resend dipindah ke kolom Status */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUserToDelete(u);
                        setDeleteModalOpen(true);
                      }}
                      className="border-none shadow-none"
                    >
                      <Trash className="size-4 text-[#A4A7AE]" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelected(u);
                        setModalMode("edit");
                        setModalOpen(true);
                      }}
                      className="border-none shadow-none"
                    >
                      <Pencil className="size-4 text-[#A4A7AE]" />
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
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                            variant={
                              pageNum === paginationInfo.pageSafe
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setPage(pageNum as number)}
                            className="w-8 h-8 p-0 bg-[#FAFAFA] border border-[#E9EAEB] text-[#A4A7AE] hover:bg-[#E9EAEB]"
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
                      setPage((p) => Math.min(paginationInfo.totalPages, p + 1))
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

      <UsersEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        user={selected as any}
        onSubmit={handleSubmit}
      />

      <UserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        user={selected as User & { profile?: Profile | null }}
      />

      <DeleteUserModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        user={userToDelete as User & { profile?: Profile | null }}
      />
    </div>
  );
}
