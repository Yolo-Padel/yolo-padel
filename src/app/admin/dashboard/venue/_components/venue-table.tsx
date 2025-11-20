"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Bell, Dot, LandPlot, LayoutGrid, User } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Pencil, PlusIcon } from "lucide-react";
import { VenueFormSheet } from "./add-venue";
import { EditVenueDetails } from "./details-venue";
import { DeleteVenue } from "./venue-delete";
import { useVenue } from "@/hooks/use-venue";
import { Venue } from "@/types/prisma";
import { useRouter } from "next/navigation";
import { VenueTableSkeleton } from "@/app/admin/dashboard/venue/_components/venue-skeleton";
import { VenueEmptyState } from "@/app/admin/dashboard/venue/_components/venue-empty-state";

type VenueRow = {
  id: string;
  venueName: string;
  image: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  openHour?: string;
  closeHour?: string;
  description?: string;
  images?: string[];
  isActive?: boolean;
  courtsCount?: number;
  bookingsToday?: number;
};

const PAGE_SIZE = 10;

export function VenueTable() {
  const [page, setPage] = React.useState(1);
  const [addSheetOpen, setAddVenueOpen] = React.useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);
  const [selectedVenue, setSelectedVenue] = React.useState<VenueRow | null>(
    null
  );
  const [editSheetOpen, setEditSheetOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const { data, isLoading, error } = useVenue();
  const router = useRouter();

  const allVenues =
    (data?.data as
      | (Venue & { _counts?: { courts: number; bookingsToday: number } })[]
      | undefined) || [];

  const rows: VenueRow[] = React.useMemo(() => {
    return allVenues.map((v) => ({
      id: v.id,
      venueName: v.name,
      image: v.images?.[0] || "/paddle-court1.svg",
      phoneNumber: v.phone || "",
      address: v.address || "",
      city: v.city || "",
      openHour: v.openHour || "07:00",
      closeHour: v.closeHour || "23:00",
      description: v.description || "",
      images: v.images || [],
      isActive: v.isActive ?? true,
      courtsCount: v._counts?.courts ?? 0,
      bookingsToday: v._counts?.bookingsToday ?? 0,
    }));
  }, [allVenues]);

  // Frontend filtering and pagination
  const filtered = useMemo(() => {
    return rows;
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paginated = React.useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageSafe]);

  async function handleSubmit() {
    // Dummy submit: console log value
    console.log("");
  }

  async function handleEditDetailsVenue() {
    console.log("Edit Details");
    setDetailSheetOpen(false);
  }

  function handleEditVenue() {
    console.log("Edit Venue clicked");
    setEditSheetOpen(true);
  }

  function handleDeleteVenue() {
    console.log("Delete Venue clicked");
    // Close details modal first
    setDetailSheetOpen(false);
    // Then open delete modal
    setDeleteModalOpen(true);
  }

  function handleDeleteSuccess() {
    setSelectedVenue(null);
    setDeleteModalOpen(false);
    setDetailSheetOpen(false);
    // The useVenue hook will automatically refetch data
  }

  function handleDeleteCancel() {
    setDeleteModalOpen(false);
    // Reopen details modal if user cancels delete
    setDetailSheetOpen(true);
  }

  // Show loading state
  if (isLoading) {
    return <VenueTableSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-1">
          <h3 className="text-2xl font-bold">Venue List</h3>
          <Button
            variant="outline"
            onClick={() => setAddVenueOpen(true)}
            className="font-normal bg-[#C3D223] hover:bg-[#A9B920] text-black rounded-sm"
          >
            Add Venue
            <PlusIcon className="mr-2 size-4" />
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 mb-2">Error loading venues</div>
            <p className="text-gray-500">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold ">Venue List</h2>
          <Badge className="text-[#6941C6] bg-[#F9F5FF] border-[#E9D7FE] shadow-none rounded-4xl">
            2 venues
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setAddVenueOpen(true)}
            className="font-normal bg-[#C3D223] hover:bg-[#A9B920] text-black rounded-sm"
          >
            Add Venue
            <PlusIcon className="mr-0 size-4" />
          </Button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <VenueEmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginated.map((venue) => (
            <Card
              className="gap-3 p-4 hover:shadow-xl transition-shadow duration-300"
              key={venue.id}
            >
              <div className="flex flex-col px-0">
                <Image
                  src={venue.image}
                  alt=""
                  className="flex-1 w-full rounded-sm aspect-square"
                  width={500}
                  height={500}
                />
              </div>
              <div className="flex flex-col text-md gap-1">
                <CardTitle className="text-sm font-semibold truncate">
                  {venue.venueName}
                </CardTitle>
                <div className="mt-0 flex items-left gap-1 text-gray-600 text-xs items-center">
                  <LandPlot className="size-4" />
                  <span>
                    {venue.courtsCount ?? 0} Court
                    {(venue.courtsCount ?? 0) === 1 ? "" : "s"}
                  </span>
                  <Dot />
                  <span>{venue.bookingsToday ?? 0} Booking Today</span>
                </div>
              </div>
              <div className="flex w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={() => {
                    setSelectedVenue(venue);
                    setDetailSheetOpen(true);
                  }}
                  className="w-full border-primary"
                  variant="outline"
                >
                  See Detail
                </Button>
                <Button
                  variant="default"
                  onClick={() =>
                    router.push(`/admin/dashboard/court?venueId=${venue.id}`)
                  }
                >
                  Manage Court
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {paginated.length} of {filtered.length} venues
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={pageSafe <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {pageSafe} / {totalPages}
          </div>
          <Button
            variant="outline"
            disabled={pageSafe >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
      <VenueFormSheet
        open={addSheetOpen}
        onOpenChange={setAddVenueOpen}
        venueData={null}
        mode="create"
      />
      <EditVenueDetails
        detailSheetOpen={detailSheetOpen}
        onOpenChange={() => setDetailSheetOpen(false)}
        detailsVenue={selectedVenue as any}
        onSubmit={handleEditDetailsVenue}
        onEditVenue={handleEditVenue}
        onDeleteVenue={handleDeleteVenue}
      />

      {/* Edit Venue Sheet */}
      <VenueFormSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        venueData={
          selectedVenue
            ? {
                id: selectedVenue.id,
                name: selectedVenue.venueName,
                address: selectedVenue.address || "",
                description: selectedVenue.description || "",
                images: selectedVenue.images || [],
                city: selectedVenue.city || "",
                phone: selectedVenue.phoneNumber || "",
                openHour: selectedVenue.openHour || "07:00",
                closeHour: selectedVenue.closeHour || "23:00",
                isActive: selectedVenue.isActive ?? true,
              }
            : null
        }
        mode="edit"
      />

      {/* Delete Venue Modal */}
      <DeleteVenue
        deleteSheetOpen={deleteModalOpen}
        onOpenChange={handleDeleteCancel}
        venueData={
          selectedVenue
            ? {
                id: selectedVenue.id,
                name: selectedVenue.venueName,
                address: selectedVenue.address,
              }
            : null
        }
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
