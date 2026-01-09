"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useCourtByVenue, useToggleCourtAvailability } from "@/hooks/use-court";
import { useVenueById } from "@/hooks/use-venue";
import { usePermissionGuard } from "@/hooks/use-permission-guard";
import { Court as PrismaCourt, OpeningHoursType } from "@/types/prisma";
import {
  calculatePaginationInfo,
  getPaginatedData,
} from "@/lib/pagination-utils";
import { formatOperatingHours } from "@/lib/operating-hours-utils";

// Components
import { CourtHeader } from "./_components/court-header";
import { CourtBreadcrumb } from "./_components/court-breadcrumb";
import { CourtTable, type Court } from "./_components/court-table";
import { CourtTableSkeleton } from "./_components/court-skeleton";
import { CourtEmptyState } from "./_components/court-empty-state";
import { CourtModal } from "./_components/court-modal";
import { CourtDeleteModal } from "./_components/court-delete-modal";

// ════════════════════════════════════════════════════════
// Constants
// ════════════════════════════════════════════════════════

const PAGE_SIZE = 10;

// ════════════════════════════════════════════════════════
// Main Component (Container/Orchestrator)
// ════════════════════════════════════════════════════════

export default function CourtPage() {
  const searchParams = useSearchParams();

  // ════════════════════════════════════════════════════════
  // URL State
  // ════════════════════════════════════════════════════════

  const venueId = searchParams.get("venueId") || "";

  // ════════════════════════════════════════════════════════
  // Local State
  // ════════════════════════════════════════════════════════

  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courtToDelete, setCourtToDelete] = useState<Court | null>(null);

  // ════════════════════════════════════════════════════════
  // Data Fetching
  // ════════════════════════════════════════════════════════

  const { data: courtData, isLoading, error } = useCourtByVenue(venueId);
  const { data: venueData } = useVenueById(venueId);
  const toggleCourtAvailability = useToggleCourtAvailability();

  // ════════════════════════════════════════════════════════
  // Permissions
  // ════════════════════════════════════════════════════════

  const { canAccess: canCreateCourt } = usePermissionGuard({
    moduleKey: "courts",
    action: "create",
  });

  const { canAccess: canUpdateCourt } = usePermissionGuard({
    moduleKey: "courts",
    action: "update",
  });

  const { canAccess: canDeleteCourt } = usePermissionGuard({
    moduleKey: "courts",
    action: "delete",
  });

  // ════════════════════════════════════════════════════════
  // Data Transformation
  // ════════════════════════════════════════════════════════

  const courts: Court[] = useMemo(() => {
    if (!courtData?.data) return [];

    return (courtData.data as PrismaCourt[]).map((court) => {
      const operatingHours = (court as any).operatingHours || [];
      const venueDefaultHours = venueData?.data
        ? {
            openHour: venueData.data.openHour,
            closeHour: venueData.data.closeHour,
          }
        : undefined;

      return {
        id: court.id,
        courtName: court.name,
        status: court.isActive ? "Available" : "Unavailable",
        pricePerHour: court.price || 0,
        availability: court.isActive,
        availabilityTime: formatOperatingHours(
          operatingHours,
          venueDefaultHours,
        ),
        image: (court as any).image,
        openingHours: court.openingType,
        operatingHours: operatingHours,
        ayoFieldId: court.ayoFieldId,
      };
    });
  }, [courtData, venueData]);

  // ════════════════════════════════════════════════════════
  // Pagination (Frontend)
  // ════════════════════════════════════════════════════════

  const paginationInfo = useMemo(
    () => calculatePaginationInfo(page, courts.length, PAGE_SIZE),
    [page, courts.length],
  );

  const paginatedCourts = useMemo(
    () => getPaginatedData(courts, page, PAGE_SIZE),
    [courts, page],
  );

  // ════════════════════════════════════════════════════════
  // Event Handlers
  // ════════════════════════════════════════════════════════

  const handleAddCourt = () => {
    setModalMode("add");
    setSelectedCourt(null);
    setModalOpen(true);
  };

  const handleEditCourt = (court: Court) => {
    setModalMode("edit");
    setSelectedCourt(court);
    setModalOpen(true);
  };

  const handleViewCourt = (court: Court) => {
    setModalMode("view");
    setSelectedCourt(court);
    setModalOpen(true);
  };

  const handleDeleteCourt = (court: Court) => {
    setCourtToDelete(court);
    setDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setCourtToDelete(null);
  };

  const handleToggleAvailability = (courtId: string) => {
    toggleCourtAvailability.mutate(courtId);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // ════════════════════════════════════════════════════════
  // Loading State
  // ════════════════════════════════════════════════════════

  if (isLoading) {
    return <CourtTableSkeleton />;
  }

  // ════════════════════════════════════════════════════════
  // Error State
  // ════════════════════════════════════════════════════════

  if (error) {
    return (
      <div className="flex flex-col space-y-6">
        <CourtHeader
          courtCount={0}
          canCreateCourt={canCreateCourt}
          onAddCourt={handleAddCourt}
        />
        <CourtBreadcrumb venueName={venueData?.data?.name} />
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-red-500 mb-2">Error loading courts</div>
            <p className="text-gray-500">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // Empty State
  // ════════════════════════════════════════════════════════

  if (courts.length === 0) {
    return (
      <div className="flex flex-col space-y-6">
        <CourtHeader
          courtCount={0}
          canCreateCourt={canCreateCourt}
          onAddCourt={handleAddCourt}
        />
        <CourtBreadcrumb venueName={venueData?.data?.name} />
        <CourtEmptyState />

        <CourtModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          venueId={venueId}
          venueName={venueData?.data?.name || "Unknown Venue"}
        />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // Main Render
  // ════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col space-y-6">
      <CourtHeader
        courtCount={courts.length}
        canCreateCourt={canCreateCourt}
        onAddCourt={handleAddCourt}
      />
      <CourtBreadcrumb venueName={venueData?.data?.name} />

      <CourtTable
        courts={paginatedCourts}
        paginationInfo={paginationInfo}
        canUpdateCourt={canUpdateCourt}
        canDeleteCourt={canDeleteCourt}
        isToggling={toggleCourtAvailability.isPending}
        onPageChange={handlePageChange}
        onEditCourt={handleEditCourt}
        onViewCourt={handleViewCourt}
        onDeleteCourt={handleDeleteCourt}
        onToggleAvailability={handleToggleAvailability}
      />

      <CourtModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        venueId={venueId}
        venueName={venueData?.data?.name || "Unknown Venue"}
        court={
          selectedCourt
            ? {
                id: selectedCourt.id,
                name: selectedCourt.courtName,
                price: selectedCourt.pricePerHour,
                image: selectedCourt.image,
                openingHours:
                  selectedCourt.openingHours || OpeningHoursType.REGULAR,
                operatingHours: selectedCourt.operatingHours || [],
                ayoFieldId: selectedCourt.ayoFieldId || null,
              }
            : undefined
        }
      />

      <CourtDeleteModal
        deleteModalOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        courtData={
          courtToDelete
            ? {
                id: courtToDelete.id,
                name: courtToDelete.courtName,
                price: courtToDelete.pricePerHour,
              }
            : null
        }
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
