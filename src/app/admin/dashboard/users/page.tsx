"use client";

import { useState } from "react";
import { useAdminUsers } from "@/hooks/use-users";
import { useUserFilters } from "@/hooks/use-user-filters";
import { UserHeader } from "@/app/admin/dashboard/users/_components/user-header";
import { UsersTable } from "@/app/admin/dashboard/users/_components/users-table";
import { UserFilters } from "@/app/admin/dashboard/users/_components/user-filters";
import { UserTableSkeleton } from "@/app/admin/dashboard/users/_components/user-table-skeleton";
import { UserEmptyState } from "@/app/admin/dashboard/users/_components/user-empty-state";
import { UserModal } from "@/app/admin/dashboard/users/_components/user-modal";
import { DeleteUserModal } from "@/app/admin/dashboard/users/_components/delete-user-modal";
import { User, Profile } from "@/types/prisma";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePermissionGuard } from "@/hooks/use-permission-guard";

const PAGE_SIZE = 10;

export default function UsersPage() {
  // Access Control
  const { canAccess: canCreateUser, isLoading: isCreateLoading } =
    usePermissionGuard({
      moduleKey: "users",
      action: "create",
    });
  const { canAccess: canEditUser, isLoading: isEditLoading } =
    usePermissionGuard({
      moduleKey: "users",
      action: "update",
    });
  const { canAccess: canDeleteUser, isLoading: isDeleteLoading } =
    usePermissionGuard({
      moduleKey: "users",
      action: "delete",
    });
  const isPermissionLoading =
    isCreateLoading || isEditLoading || isDeleteLoading;
  // Use the useUserFilters hook for all filter logic
  const {
    filters,
    setSearch,
    setStatus,
    setVenue,
    setPage,
    resetFilters,
    hasActiveFilters,
  } = useUserFilters();

  // Build options object from filter state and pass to hook
  // Staff management: only show ADMIN and STAFF users (exclude USER type)
  const filterOptions = {
    search: filters.search || undefined,
    userType: "STAFF_ONLY", // Special filter to exclude USER type
    status: filters.status || undefined,
    venue: filters.venue || undefined,
    page: filters.page,
    limit: PAGE_SIZE,
  };

  // Pass filter options to useAdminUsers hook to trigger API call
  const { data, isLoading, isFetching, error } = useAdminUsers(filterOptions);

  // Use pagination metadata from API response
  const users = data?.data ?? [];
  const apiPagination = data?.pagination;

  // Transform API pagination to match UsersTable's PaginationInfo interface
  const paginationInfo = apiPagination
    ? {
        pageSafe: apiPagination.page,
        totalPages: apiPagination.totalPages,
        hasPreviousPage: apiPagination.page > 1,
        hasNextPage: apiPagination.page < apiPagination.totalPages,
        total: apiPagination.total,
      }
    : {
        pageSafe: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
        total: 0,
      };

  // Distinguish between initial load and refetch
  const isInitialLoad = isLoading && !data;
  const isRefetching = isFetching && !isInitialLoad;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedUser, setSelectedUser] = useState<
    (User & { profile?: Profile | null }) | undefined
  >(undefined);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<
    (User & { profile?: Profile | null }) | undefined
  >(undefined);

  // Event handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value === "all" ? "" : value);
  };

  const handleVenueChange = (value: string) => {
    setVenue(value === "all" ? "" : value);
  };

  const handleAddUser = () => {
    setModalMode("add");
    setSelectedUser(undefined);
    setModalOpen(true);
  };

  const handleEditUser = (user: User & { profile?: Profile | null }) => {
    setModalMode(canEditUser && !isPermissionLoading ? "edit" : "view");
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDeleteUser = (user: User & { profile?: Profile | null }) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  // Display error message on failure
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <UserHeader userCount={0} />
          <Button
            onClick={handleAddUser}
            className="bg-brand text-brand-foreground"
            disabled
          >
            Add Staff
            <Plus className="ml-0 size-4" />
          </Button>
        </div>
        <UserFilters
          searchValue={filters.search}
          statusFilter={filters.status}
          venueFilter={filters.venue}
          onSearchSubmit={setSearch}
          onStatusChange={handleStatusChange}
          onVenueChange={handleVenueChange}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
        />
        <div className="rounded-2xl border border-[#E9EAEB] p-8 text-center">
          <p className="text-red-600 font-medium mb-2">Failed to load staff</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "An error occurred while fetching staff"}
          </p>
        </div>
      </div>
    );
  }

  // Conditional rendering - Empty state
  if (!isInitialLoad && users.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <UserHeader userCount={apiPagination?.total ?? 0} />
          <Button
            onClick={handleAddUser}
            className="bg-brand text-brand-foreground"
          >
            Add Staff
            <Plus className="ml-0 size-4" />
          </Button>
        </div>
        <UserFilters
          searchValue={filters.search}
          statusFilter={filters.status}
          venueFilter={filters.venue}
          onSearchSubmit={setSearch}
          onStatusChange={handleStatusChange}
          onVenueChange={handleVenueChange}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
        />
        <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
          <UserEmptyState isFiltered={hasActiveFilters} />
        </div>
      </div>
    );
  }

  // Main UI rendering
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <UserHeader userCount={apiPagination?.total ?? 0} />

        {canCreateUser && !isPermissionLoading && (
          <Button
            onClick={handleAddUser}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            Add Staff
            <Plus className="ml-0 size-4" />
          </Button>
        )}
      </div>

      <UserFilters
        searchValue={filters.search}
        statusFilter={filters.status}
        venueFilter={filters.venue}
        onSearchSubmit={setSearch}
        onStatusChange={handleStatusChange}
        onVenueChange={handleVenueChange}
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
      />

      {/* Distinguish initial load vs refetch loading states */}
      {isInitialLoad || isRefetching ? (
        <UserTableSkeleton />
      ) : (
        <UsersTable
          users={users}
          paginationInfo={paginationInfo}
          onPageChange={handlePageChange}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          canDeleteUser={canDeleteUser}
          canEditUser={canEditUser}
          isPermissionLoading={isPermissionLoading}
        />
      )}

      <UserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        user={selectedUser}
        isStaffOnly={true}
      />

      <DeleteUserModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        user={userToDelete}
      />
    </div>
  );
}
