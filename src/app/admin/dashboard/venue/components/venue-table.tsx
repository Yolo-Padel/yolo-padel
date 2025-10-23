"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
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
import { Search, X, Pencil, PlusIcon } from "lucide-react";
import { EditVenue } from "./venue-edit-sheet";
import { AddVenue } from "./add-venue";
import { EditVenueDetails } from "./details-venue";

type VenueRow = {
  id: string;
  venueName: string;
  phoneNumber?: number;
  address: string;
  city: string;
  totalCourts: number;
  totalBooking: number;
  admin: string;
  image: string;
};

const DUMMY_DATA: VenueRow[] = [
  {
    id: "v_1",
    venueName: "Slipi Paddle Center",
    phoneNumber: 81234567890,
    address: "123 Main St, Anytown, USA",
    city: "Jakarta",
    totalCourts: 10,
    totalBooking: 5,
    admin: "Revina",
    image: "/paddle-court1.svg",
  },
  {
    id: "v_2",
    venueName: "Lebak Bulus Paddle Center",
    phoneNumber: 81234567890,
    address: "456 Oak St, Somewhere, USA",
    city: "Jakarta",
    totalCourts: 8,
    totalBooking: 3,
    admin: "Angga",
    image: "/paddle-court2.svg",
  },
  {
    id: "v_3",
    venueName: "BSD Paddle Center",
    phoneNumber: 81234567890,
    address: "456 Oak St, Somewhere, USA",
    city: "Jakarta",
    totalCourts: 10,
    totalBooking: 2,
    admin: "Joko",
    image: "/paddle-court3.svg",
  },
];

const PAGE_SIZE = 10;

export function VenueTable() {
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [addSheetOpen, setAddVenueOpen] = React.useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);
  const [selectedVenue, setSelectedVenue] = React.useState<VenueRow | null>(null);  

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return DUMMY_DATA;
    return DUMMY_DATA.filter((u) => {
      const fullName = `${u.venueName ?? ""}`.toLowerCase();
      return (
        u.venueName.toLowerCase().includes(q) ||
        u.address.toLowerCase().includes(q) ||
        fullName.includes(q)
      );
    });
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paginated = React.useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageSafe]);

  React.useEffect(() => {
    setPage(1);
  }, [query]);

  async function handleSubmit() {
    // Dummy submit: console log value
    console.log("");
  }

  async function handleAddVenue() {
    console.log("Add Venue");
    setAddVenueOpen(false);
  }

  async function handleEditDetailsVenue() {
    console.log("Edit Details");
    setDetailSheetOpen(false);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
      {paginated.map((venue) => (
      <Card className="min-w-0 max-w-[265px] shadow-lg hover:shadow-xl transition-shadow duration-300 p-1 gap-3" key={venue.id}>
        <CardHeader className="p-2">
            <img
              src={venue.image}
              className="w-full h-full object-cover"
            />
        </CardHeader>
        <CardContent className="px-2 pt-0 pb-1 text-sm text-gray-700">
              <CardTitle className="text-base font-semibold truncate">
                {venue.venueName}
              </CardTitle>
              <div className="mt-0 flex items-left gap-2 text-gray-600">
                <LandPlot className="size-4" />
                <span>{venue.totalCourts} Court</span>
                <Dot />
                <span>{venue.totalBooking} Booking Today</span>
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
          >
            Manage Court
          </Button>
        </CardFooter>
      </Card>
      ))}
      </div>
      
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
      <AddVenue
        open={addSheetOpen}
        venueData={null}
        onOpenChange={() => setAddVenueOpen(false)}
        onSubmit={handleAddVenue}
      />
      <EditVenueDetails
        detailSheetOpen={detailSheetOpen}
        onOpenChange={() => setDetailSheetOpen(false)}
        detailsVenue={selectedVenue}
        onSubmit={handleEditDetailsVenue}
      />
    </div>
  );
}
