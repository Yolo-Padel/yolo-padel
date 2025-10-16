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
import { Search, X, Pencil } from "lucide-react"
import { UsersEditSheet } from "@/app/admin/dashboard/users/components/users-edit-sheet"
import { id } from "zod/v4/locales"
import { profile } from "console"
import { VenueEditSheet } from "./venue-edit-sheet"

type venueStatus = "Available" | "Fully Booked" | "Under Maintenance"

type Venue = {
  id: string
  venueName: string
  location: string
  totalCourts: number
  openingHours: string
  admin: string
  status: venueStatus
}

type Profile = {
  userId: string
  firstName?: string | null
  lastName?: string | null
  bio?: string | null
  avatar?: string | null
}

type VenueRow = Venue & { profile?: Profile | null }

const DUMMY_DATA: VenueRow[] = [
  {
    id: "v_1",
    venueName: "Yolo Padel",
    location: "123 Main St, Anytown, USA",
    totalCourts: 10,
    openingHours: "9:00 AM - 6:00 PM",
    admin: "admin@yolopadel.com",
    status: "Available",
    profile: {
      userId: "u_1",
      firstName: "Admin",
      lastName: "Yolo",
      bio: "System administrator",
      avatar: undefined,
    },
  },
  {
    id: "v_2",
    venueName: "Jane's Padel",
    location: "456 Oak St, Somewhere, USA",
    totalCourts: 8,
    openingHours: "9:00 AM - 6:00 PM",
    admin: "jane.smith@example.com",
    status: "Fully Booked",
    profile: {
      userId: "u_2",
      firstName: "Jane",
      lastName: "Smith",
      bio: "Player",
      avatar: undefined,
    },
  }
]

const PAGE_SIZE = 10

export function VenueTable() {
  const [query, setQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<VenueRow | null>(null)

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return DUMMY_DATA
    return DUMMY_DATA.filter((u) => {
      const fullName = `${u.profile?.firstName ?? ""} ${u.profile?.lastName ?? ""}`.toLowerCase()
      return (
        u.venueName.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q) ||
        fullName.includes(q)
      )
    })
  }, [query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const paginated = React.useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setSheetOpen(true)}>
            <Pencil className="mr-2 size-4" />
            Add New Venue
          </Button>
        </div>
      
      <div className="flex items-center justify-end gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search venue"
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
      </div>
    </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Venue Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Total Courts</TableHead>
            <TableHead>Opening Hours</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((u) => {
            const fullName = [u.profile?.firstName, u.profile?.lastName].filter(Boolean).join(" ") || "-"
            return (
              <TableRow key={u.id}>
                <TableCell>{u.venueName}</TableCell>
                <TableCell>{u.location}</TableCell>
                <TableCell>{u.totalCourts}</TableCell>
                <TableCell>{u.openingHours}</TableCell>
                <TableCell>{fullName}</TableCell>
                <TableCell>{u.status}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelected(u); setSheetOpen(true) }}
                  >
                    <Pencil className="mr-2 size-4" />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {paginated.length} of {filtered.length} venues
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={pageSafe <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <div className="text-sm">Page {pageSafe} / {totalPages}</div>
          <Button variant="outline" disabled={pageSafe >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next
          </Button>
        </div>
      </div>
      
      <VenueEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        venue={selected}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
