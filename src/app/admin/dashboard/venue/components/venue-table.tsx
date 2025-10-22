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

type VenueRow = {
  id: string;
  venueName: string;
  descriptions: string;
  address: string;
  totalCourts: number;
  totalBooking: number;
  user: string;
  image: string;
  isActive: boolean;
};

const DUMMY_DATA: VenueRow[] = [
  {
    id: "v_1",
    venueName: "Slipi Paddle Center",
    descriptions: "A modern padel court with top-notch facilities",
    address: "123 Main St, Anytown, USA",
    totalCourts: 10,
    totalBooking: 5,
    user: "Revina",
    isActive: true,
    image: "/paddle-court1.svg",
  },
  {
    id: "v_2",
    venueName: "Lebak Bulus Paddle Center",
    descriptions: "A modern padel court with top-notch facilities",
    address: "456 Oak St, Somewhere, USA",
    totalCourts: 8,
    totalBooking: 3,
    user: "Angga",
    isActive: false,
    image: "/paddle-court1.svg",
  },
  {
    id: "v_3",
    venueName: "BSD Paddle Center",
    descriptions: "A modern padel court with top-notch facilities",
    address: "456 Oak St, Somewhere, USA",
    totalCourts: 10,
    totalBooking: 2,
    user: "Joko",
    isActive: false,
    image: "/paddle-court1.svg",
  },
];

const PAGE_SIZE = 10;

export function VenueTable() {
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<VenueRow | null>(null);

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 py-4">
        <h3 className="text-2xl font-semibold ">Venue Management</h3>
        <div className="relative w-full max-w-sm flex items-center gap-4">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 pr-8"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="size-4" />
            </button>
          )}
          <Button variant="outline" size="sm" className="bg-gray-200">
            <Bell className="size-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-1">
        <h3 className="text-xl font-semibold ">Venue List</h3>
        <Button
          variant="outline"
          onClick={() => setSheetOpen(true)}
          className="font-normal font-weight-500 bg-[#C3D223] rounded-sm"
        >
          Add Venue
          <PlusIcon className="mr-2 size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-5 gap-4">
      {paginated.map((venue) => (
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300" key={venue.id}>
        <CardHeader>
          <div className="relative max-48 overflow-hidden rounded-t-lg">
            <img
              src={venue.image}
              className="w-full h-full object-cover"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-1 text-xs text-gray-600">
          <CardTitle className="text-lg font-bold h-8 overflow-visible whitespace-nowrap text-ellipsis">{venue.venueName}</CardTitle>
          <div className="flex items-center space-x-3">
            <LandPlot className="size-4" /> {venue.totalCourts} Courts <Dot/> {venue.totalBooking} Bookings today
          </div>
          <div className="flex items-center space-x-3">
            <User className="size-4"/> <span> {venue.user} </span>
            
          </div>
        </CardContent>

        <CardFooter className="flex justify-between gap-2">
          <Button variant="outline" size="default" className="border-[#C3D223] text-black font-normal rounded-sm">
            See Details
          </Button>
          <Button variant="default" size="default" className="bg-[#C3D223] hover:bg-[#A9B920] text-black font-normal rounded-sm">
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
    </div>
  );
}
