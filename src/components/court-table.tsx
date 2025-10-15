"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, X, Pencil, Filter } from "lucide-react"
import { CourtEditSheet } from "./court-edit-sheet"

// Types
type CourtType = "INDOOR" | "OUTDOOR"
type CourtStatus = "Available" | "Booked" | "Re-Schedule" | "Cancel"
type CourtVenue = "Court Paddle Lebak Bulus" | "Court Paddle PIK" | "Court Paddle Kemang"

type Court = {
  id: string
  courtName: string
  courtType: CourtType
  status: CourtStatus
  venue: CourtVenue
  bookingTime?: string | null
  createdAt: string
}

const DUMMY_DATA: Court[] = [
  {
    id: "A12QCxxxxx",
    courtName: "Court 1",
    courtType: "INDOOR",
    status: "Available",
    venue: "Court Paddle Lebak Bulus",
    bookingTime: "09:00 - 11:00",
    createdAt: new Date().toISOString(),
  },
  {
    id: "S12QCxxxxx",
    courtName: "Court 2",
    courtType: "INDOOR",
    status: "Booked",
    venue: "Court Paddle Kemang",
    bookingTime: "13:00 - 15:00",
    createdAt: new Date().toISOString(),
  },
  {
    id: "C12QCxxxxx",
    courtName: "Court 3",
    courtType: "OUTDOOR",
    status: "Booked",
    venue: "Court Paddle Kemang",
    bookingTime: "19:00 - 21:00",
    createdAt: new Date().toISOString(),
  },
]

const PAGE_SIZE = 10

export function CourtTable() {
  const [query, setQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [statusFilter, setStatusFilter] = React.useState<CourtStatus | "All">("All")
  const [selected, setSelected] = React.useState<Court | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)

  // Debug: tambahkan console.log
  console.log("DUMMY_DATA:", DUMMY_DATA)
  console.log("statusFilter:", statusFilter)

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim()
    let result = DUMMY_DATA

    // Filter berdasarkan status
    if (statusFilter !== "All") {
      result = result.filter((court) => court.status === statusFilter)
    }

    // Filter berdasarkan search query
    if (q) {
      result = result.filter((court) => {
        return (
          court.courtName.toLowerCase().includes(q) ||
          court.venue.toLowerCase().includes(q) ||
          court.courtType.toLowerCase().includes(q)
        )
      })
    }

    console.log("filtered result:", result)
    return result
  }, [query, statusFilter])

  const getStatusLabel = (status: CourtStatus | "All") => {
    switch (status) {
      case "Available":
        return "Available"
      case "Booked":
        return "Booked"
      case "Re-Schedule":
        return "Re-Schedule"
      case "Cancel":
        return "Cancel"
      case "All":
        return "All Status"
      default:
        return "All Status"
    }
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const paginated = React.useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE
    const result = filtered.slice(start, start + PAGE_SIZE)
    console.log("paginated result:", result)
    return result
  }, [filtered, pageSafe])

  React.useEffect(() => {
    setPage(1)
  }, [query])

  async function handleSubmit() {
    // Dummy submit: console log value
    console.log("")
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filter */}
      <div className="flex items-center justify-end gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search court name, venue, or type"
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
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 size-4" />
              Filter by Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("All")}>
              All Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("Available")}>
              Available
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("Booked")}>
              Booked
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("Re-Schedule")}>
              Re-Schedule
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("Cancel")}>
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active filters display */}
      {(statusFilter !== "All" || query) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {statusFilter !== "All" && (
            <Badge variant="outline" className="gap-1">
              Status: {getStatusLabel(statusFilter)}
              <button
                onClick={() => setStatusFilter("All")}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
          {query && (
            <Badge variant="outline" className="gap-1">
              Search: "{query}"
              <button
                onClick={() => setQuery("")}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Debug info */}
      <div className="text-sm text-gray-500">
        Debug: Total data: {DUMMY_DATA.length}, Filtered: {filtered.length}, Paginated: {paginated.length}
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Court Name</TableHead>
            <TableHead>Venue</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Booking Time</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.length > 0 ? (
            paginated.map((court) => (
              <TableRow key={court.id}>
                <TableCell className="font-medium">{court.courtName}</TableCell>
                <TableCell>{court.venue}</TableCell>
                <TableCell>
                  <Badge variant={court.courtType === "INDOOR" ? "outline" : "secondary"}>
                    {court.courtType}
                  </Badge>
                </TableCell>
                <TableCell>{getStatusLabel(court.status)}</TableCell>
                <TableCell>{court.bookingTime || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelected(court); setSheetOpen(true) }}
                  >
                    <Pencil className="mr-2 size-4" />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {paginated.length} of {filtered.length} courts
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            disabled={pageSafe <= 1} 
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <div className="text-sm">Page {pageSafe} / {totalPages}</div>
          <Button 
            variant="outline" 
            disabled={pageSafe >= totalPages} 
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
      <CourtEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        court={selected}
        onSubmit={handleSubmit}
      />
    </div>
  )
}