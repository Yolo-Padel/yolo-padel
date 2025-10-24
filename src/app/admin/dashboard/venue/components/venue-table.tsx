"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Dot, LandPlot, LayoutGrid, User } from "lucide-react";
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
import { useVenue } from "@/hooks/use-venue";
import { Venue } from "@/types/prisma";
import { useRouter } from "next/navigation";
import { VenueTableSkeleton } from "@/app/admin/dashboard/venue/components/venue-skeleton";
import { VenueEmptyState } from "@/app/admin/dashboard/venue/components/venue-empty-state";

type VenueRow = {
  id: string;
  venueName: string;
  image: string;
};

const PAGE_SIZE = 10;

export function VenueTable() {
  const [page, setPage] = React.useState(1);
  const [addSheetOpen, setAddVenueOpen] = React.useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);
  const [selectedVenue, setSelectedVenue] = React.useState<VenueRow | null>(null);  
  const { data, isLoading, error } = useVenue();
  const router = useRouter();

  const allVenues = (data?.data as Venue[] | undefined) || [];

  const rows: VenueRow[] = React.useMemo(() => {
    return allVenues.map((v) => ({
      id: v.id,
      venueName: v.name,
      image: v.images?.[0] || "/paddle-court1.svg",
    }));
  }, [allVenues]);

  const filtered = rows;

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

  // Show loading state
  if (isLoading) {
    return (
      <VenueTableSkeleton />
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-1">
          <h3 className="text-xl font-semibold">Venue List</h3>
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
    )
  }
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-1">
        <h3 className="text-xl font-semibold ">Venue List</h3>
        <Button
          variant="outline"
          onClick={() => setAddVenueOpen(true)}
          className="font-normal bg-[#C3D223] hover:bg-[#A9B920] text-black rounded-sm"
        >
          Add Venue
          <PlusIcon className="mr-2 size-4" />
        </Button>
      </div>
      {filtered.length === 0 ? (
        <VenueEmptyState />
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
      {paginated.map((venue) => (
      <Card className="min-w-0 max-w-[265px] shadow-lg hover:shadow-xl transition-shadow duration-300 p-1 gap-2" key={venue.id}>
        <CardHeader className="p-2">
            <img
              src={venue.image}
              className="w-full h-full object-cover rounded-sm"
            />
        </CardHeader>
        <CardContent className="px-2 pt-0 pb-1 text-sm text-gray-700 gap-1">
              <CardTitle className="text-sm font-semibold truncate">
                {venue.venueName}
              </CardTitle>
              <div className="mt-0 flex items-left gap-1 text-gray-600 text-xs items-center">
                <LandPlot className="size-4" />
                <span>X Court</span>
                <Dot />
                <span>X Booking Today</span>
              </div>
            </CardContent>
        <CardFooter className="px-1 pt-0 pb-1 w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={() => { setSelectedVenue(venue); setDetailSheetOpen(true); }}
            variant="outline"
            size="sm"
            className="rounded-sm border-[#C3D223] text-black w-full"
          >
            See Detail
          </Button>
          <Button
            variant="default"
            size="sm"
            className="rounded-sm bg-[#C3D223] hover:bg-[#A9B920] text-black w-full"
            onClick={() => router.push(`/admin/dashboard/court?venueId=${venue.id}`)}
          >
            Manage Court
          </Button>
        </CardFooter>
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
      />
    </div>
  );
}
