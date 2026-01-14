"use client";

import { useState } from "react";
import { useAdminUsers } from "@/hooks/use-users";
import { useCustomerFilters } from "@/hooks/use-customer-filters";
import { CustomerHeader } from "@/app/admin/dashboard/customers/_components/customer-header";
import { CustomerTable } from "@/app/admin/dashboard/customers/_components/customer-table";
import { CustomerFilters } from "@/app/admin/dashboard/customers/_components/customer-filters";
import { CustomerTableSkeleton } from "@/app/admin/dashboard/customers/_components/customer-table-skeleton";
import { CustomerEmptyState } from "@/app/admin/dashboard/customers/_components/customer-empty-state";
import { CustomerModal } from "@/app/admin/dashboard/customers/_components/customer-modal";
import { DeleteCustomerModal } from "@/app/admin/dashboard/customers/_components/delete-customer-modal";
import { User, Profile } from "@/types/prisma";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePermissionGuard } from "@/hooks/use-permission-guard";

const PAGE_SIZE = 10;

export default function CustomersPage() {
  // Access Control
  const { canAccess: canCreateCustomer, isLoading: isCreateLoading } =
    usePermissionGuard({
      moduleKey: "users",
      action: "create",
    });
  const { canAccess: canEditCustomer, isLoading: isEditLoading } =
    usePermissionGuard({
      moduleKey: "users",
      action: "update",
    });
  const { canAccess: canDeleteCustomer, isLoading: isDeleteLoading } =
    usePermissionGuard({
      moduleKey: "users",
      action: "delete",
    });
  const isPermissionLoading =
    isCreateLoading || isEditLoading || isDeleteLoading;

  // Use the useCustomerFilters hook for all filter logic
  const {
    filters,
    setSearch,
    setStatus,
    setPage,
    resetFilters,
    hasActiveFilters,
  } = useCustomerFilters();

  // Build options object from filter state and pass to hook
  // Customer management: only show USER type
  const filterOptions = {
    search: filters.search || undefined,
    userType: "USER_ONLY", // Special filter to show only USER type
    status: filters.status || undefined,
    page: filters.page,
    limit: PAGE_SIZE,
  };

  // Pass filter options to useAdminUsers hook to trigger API call
  const { data, isLoading, isFetching, error } = useAdminUsers(filterOptions);

  // Use pagination metadata from API response
  const customers = data?.data ?? [];
  const apiPagination = data?.pagination;

  // Transform API pagination to match CustomerTable's PaginationInfo interface
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
  const [selectedCustomer, setSelectedCustomer] = useState<
    (User & { profile?: Profile | null }) | undefined
  >(undefined);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<
    (User & { profile?: Profile | null }) | undefined
  >(undefined);

  // Event handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value === "all" ? "" : value);
  };

  const handleAddCustomer = () => {
    setModalMode("add");
    setSelectedCustomer(undefined);
    setModalOpen(true);
  };

  const handleEditCustomer = (
    customer: User & { profile?: Profile | null },
  ) => {
    setModalMode(canEditCustomer && !isPermissionLoading ? "edit" : "view");
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const handleDeleteCustomer = (
    customer: User & { profile?: Profile | null },
  ) => {
    setCustomerToDelete(customer);
    setDeleteModalOpen(true);
  };

  // Display error message on failure
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <CustomerHeader customerCount={0} />
          <Button
            onClick={handleAddCustomer}
            className="bg-brand text-brand-foreground"
            disabled
          >
            Add Customer
            <Plus className="ml-0 size-4" />
          </Button>
        </div>
        <CustomerFilters
          searchValue={filters.search}
          statusFilter={filters.status}
          onSearchSubmit={setSearch}
          onStatusChange={handleStatusChange}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
        />
        <div className="rounded-2xl border border-[#E9EAEB] p-8 text-center">
          <p className="text-red-600 font-medium mb-2">
            Failed to load customers
          </p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "An error occurred while fetching customers"}
          </p>
        </div>
      </div>
    );
  }

  // Conditional rendering - Empty state
  if (!isInitialLoad && customers.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <CustomerHeader customerCount={apiPagination?.total ?? 0} />
          <Button
            onClick={handleAddCustomer}
            className="bg-brand text-brand-foreground"
          >
            Add Customer
            <Plus className="ml-0 size-4" />
          </Button>
        </div>
        <CustomerFilters
          searchValue={filters.search}
          statusFilter={filters.status}
          onSearchSubmit={setSearch}
          onStatusChange={handleStatusChange}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
        />
        <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
          <CustomerEmptyState isFiltered={hasActiveFilters} />
        </div>
      </div>
    );
  }

  // Main UI rendering
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <CustomerHeader customerCount={apiPagination?.total ?? 0} />

        {canCreateCustomer && !isPermissionLoading && (
          <Button
            onClick={handleAddCustomer}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            Add Customer
            <Plus className="ml-0 size-4" />
          </Button>
        )}
      </div>

      <CustomerFilters
        searchValue={filters.search}
        statusFilter={filters.status}
        onSearchSubmit={setSearch}
        onStatusChange={handleStatusChange}
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
      />

      {/* Distinguish initial load vs refetch loading states */}
      {isInitialLoad || isRefetching ? (
        <CustomerTableSkeleton />
      ) : (
        <CustomerTable
          customers={customers}
          paginationInfo={paginationInfo}
          onPageChange={handlePageChange}
          onEditCustomer={handleEditCustomer}
          onDeleteCustomer={handleDeleteCustomer}
          canDeleteCustomer={canDeleteCustomer}
          canEditCustomer={canEditCustomer}
          isPermissionLoading={isPermissionLoading}
        />
      )}

      <CustomerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        customer={selectedCustomer}
      />

      <DeleteCustomerModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        customer={customerToDelete}
      />
    </div>
  );
}
