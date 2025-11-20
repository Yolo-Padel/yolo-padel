"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { stringUtils } from "@/lib/format/string";
import { cn } from "@/lib/utils";
import {
  Pencil,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { CourtModal } from "./court-modal";
import { CourtDeleteModal } from "./court-delete-modal";
import {
  generatePageNumbers,
  calculatePaginationInfo,
  getPaginatedData,
} from "@/lib/pagination-utils";
import { useCourtByVenue, useToggleCourtAvailability } from "@/hooks/use-court";
import { useVenueById } from "@/hooks/use-venue";
import { Court as PrismaCourt, OpeningHoursType } from "@/types/prisma";
import { CourtTableSkeleton } from "@/app/admin/dashboard/court/_components/court-skeleton";
import { CourtEmptyState } from "@/app/admin/dashboard/court/_components/court-empty-state";
import { CourtBreadcrumb } from "@/app/admin/dashboard/court/_components/court-breadcrumb";
import { formatOperatingHours } from "@/lib/operating-hours-utils";

// Types
type Court = {
  id: string;
  courtName: string;
  status: string; // reflected from availability field
  pricePerHour: number;
  availability: boolean;
  availabilityTime: string;
  image?: string;
  openingHours?: OpeningHoursType;
  operatingHours?: Array<{
    id: string;
    dayOfWeek: string;
    closed: boolean;
    slots: Array<{
      id: string;
      openHour: string;
      closeHour: string;
    }>;
  }>;
};

const PAGE_SIZE = 10;

export function CourtTable() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Court | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courtToDelete, setCourtToDelete] = useState<Court | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get venueId from query params
  const venueId = searchParams.get("venueId");

  // Fetch courts by venue
  const { data: courtData, isLoading, error } = useCourtByVenue(venueId || "");

  // Fetch venue details for breadcrumb
  const { data: venueData } = useVenueById(venueId || "");

  // Toggle court availability hook
  const toggleCourtAvailability = useToggleCourtAvailability();

  // Transform Prisma Court data to match our Court type
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
          venueDefaultHours
        ),
        image: (court as any).image,
        openingHours: court.openingType,
        operatingHours: operatingHours,
      };
    });
  }, [courtData, venueData]);

  // Define table columns for colSpan
  const columns = [
    "Court Name",
    "Status",
    "Price (Hour)",
    "Availability",
    "Availability Time",
    "Actions",
  ];

  // Frontend filtering and pagination
  const filtered = useMemo(() => {
    const searchQuery = searchParams.get("search")?.toLowerCase().trim();

    if (!searchQuery) {
      return courts;
    }

    return courts.filter((court: Court) => {
      const courtName = court.courtName.toLowerCase();
      const status = court.status.toLowerCase();
      const price = court.pricePerHour.toString();
      const availability = court.availability ? "available" : "unavailable";
      const availabilityTime = court.availabilityTime.toLowerCase();

      return (
        courtName.includes(searchQuery) ||
        status.includes(searchQuery) ||
        price.includes(searchQuery) ||
        availability.includes(searchQuery) ||
        availabilityTime.includes(searchQuery)
      );
    });
  }, [courts, searchParams]);

  const paginationInfo = useMemo(
    () => calculatePaginationInfo(page, filtered.length, PAGE_SIZE),
    [page, filtered.length]
  );

  const paginated = useMemo(
    () => getPaginatedData(filtered, page, PAGE_SIZE),
    [filtered, page]
  );

  const paginationButtonBaseClass =
    "w-8 h-8 p-0 bg-[#FAFAFA] border border-[#E9EAEB] text-[#A4A7AE] hover:bg-[#E9EAEB]";
  const paginationButtonActiveClass =
    "bg-primary border-primary hover:bg-primary text-black";

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [searchParams]);

  // Function to handle availability toggle
  const handleAvailabilityToggle = (courtId: string, checked: boolean) => {
    toggleCourtAvailability.mutate(courtId);
  };

  // Function to handle delete court
  const handleDeleteCourt = (court: Court) => {
    setCourtToDelete(court);
    setDeleteModalOpen(true);
  };

  // Function to handle delete success
  const handleDeleteSuccess = () => {
    setCourtToDelete(null);
    // The useCourtByVenue hook will automatically refetch data
  };

  async function handleSubmit() {
    // Dummy submit: console log value
    console.log("");
  }

  // Show loading state
  if (isLoading) {
    return <CourtTableSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 justify-between">
          <CourtBreadcrumb venueName={venueData?.data?.name} />
        </div>
        <Button
          onClick={() => {
            setModalMode("add");
            setSelected(null);
            setSheetOpen(true);
          }}
          className="text-black"
        >
          Add Court
          <Plus className="ml-2 size-4" />
        </Button>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-red-500 mb-2">Error loading courts</div>
            <p className="text-gray-500">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-semibold ">Court List</h2>
        <Badge className="text-[#6941C6] bg-[#F9F5FF] border-[#E9D7FE] shadow-none rounded-4xl">
          {courts.length} courts
        </Badge>
      </div>
      <div className="flex items-center gap-2 justify-between">
        <CourtBreadcrumb venueName={venueData?.data?.name} />
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setModalMode("add");
              setSelected(null);
              setSheetOpen(true);
            }}
            className="text-black"
          >
            Add Court
            <Plus className="ml-2 size-4" />
          </Button>
        </div>
      </div>

      {courts.length === 0 ? (
        <CourtEmptyState />
      ) : (
        <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-11">Court Name</TableHead>
                <TableHead className="h-11">Status</TableHead>
                <TableHead className="h-11">Price (Hour)</TableHead>
                <TableHead className="h-11">Availability</TableHead>
                <TableHead className="h-11">Availability Time</TableHead>
                <TableHead className="h-11 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((court: Court) => {
                return (
                  <TableRow key={court.id}>
                    <TableCell className="font-medium">
                      {court.courtName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              court.status === "Available"
                                ? "bg-green-500"
                                : court.status === "Booked"
                                  ? "bg-red-500"
                                  : court.status === "Maintenance"
                                    ? "bg-yellow-500"
                                    : "bg-gray-500"
                            }`}
                          />
                          {court.status}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span>
                        {stringUtils.formatRupiah(court.pricePerHour)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={court.availability}
                          disabled={toggleCourtAvailability.isPending}
                          onCheckedChange={(checked: boolean) => {
                            handleAvailabilityToggle(court.id, checked);
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] overflow-hidden text-ellipsis text-xs">
                      {court.availabilityTime}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setModalMode("edit");
                            setSelected(court);
                            setSheetOpen(true);
                          }}
                          className="border-none shadow-none"
                        >
                          <Pencil className="size-4 text-[#A4A7AE]" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCourt(court)}
                          className="border-none shadow-none"
                        >
                          <Trash className="size-4 text-[#A4A7AE]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
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
                              variant="outline"
                              size="sm"
                              onClick={() => setPage(pageNum as number)}
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
                      onClick={() =>
                        setPage((p) =>
                          Math.min(paginationInfo.totalPages, p + 1)
                        )
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
      )}
      <CourtModal
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={modalMode}
        venueId={venueId || ""}
        venueName={venueData?.data?.name || "Unknown Venue"}
        court={
          selected
            ? (() => {
                console.log("Selected court for modal:", selected);
                console.log("Selected pricePerHour:", selected.pricePerHour);
                console.log("Selected openingHours:", selected.openingHours);
                console.log(
                  "Selected operatingHours:",
                  selected.operatingHours
                );
                return {
                  id: selected.id,
                  name: selected.courtName,
                  price: selected.pricePerHour,
                  image: selected.image,
                  openingHours:
                    selected.openingHours || OpeningHoursType.REGULAR,
                  operatingHours: selected.operatingHours || [],
                };
              })()
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
