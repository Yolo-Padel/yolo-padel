"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Search, X, Pencil, PlusIcon } from "lucide-react"
import { EditVenue } from "./venue-edit-sheet"


type VenueRow = {
  id: string
  venueName: string
  descriptions: string
  address: string
  totalCourts: number
  image: File | null
  isActive: boolean
}

const DUMMY_DATA: (VenueRow)[] = [
  {
    id: "v_1",
    venueName: "Yolo Padel",
    descriptions: "A modern padel court with top-notch facilities",
    address: "123 Main St, Anytown, USA",
    totalCourts: 10,
    isActive: true,
    image: null,
    
  },
  {
    id: "v_2",
    venueName: "Jane's Padel",
    descriptions: "A modern padel court with top-notch facilities",
    address: "456 Oak St, Somewhere, USA",
    totalCourts: 8,
    isActive: false,
    image: null,
    
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
      const fullName = `${u.venueName ?? ""}`.toLowerCase()
      return (
        u.venueName.toLowerCase().includes(q) ||
        u.address.toLowerCase().includes(q) ||
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
        <h3 className="text-xl font-semibold ">Venue Table</h3>
        <Button variant="outline" onClick={() => setSheetOpen(true)} className="font-normal font-weight-500 bg-[#C3D223] rounded-sm">
          Add Venue
          <PlusIcon className="mr-2 size-4" />
        </Button>
      
    </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Venue Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Total Courts</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((u) => {
            
            return (
              <TableRow key={u.id}>
                <TableCell>{u.venueName}</TableCell>
                <TableCell>{u.descriptions}</TableCell>
                <TableCell>{u.address}</TableCell>
                <TableCell>{u.totalCourts}</TableCell>
                <TableCell>{u.image ? "Yes" : "No"}</TableCell>
                <TableCell>{u.isActive ? "Active" : "Inactive"}</TableCell>
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
       <EditVenue
        open={sheetOpen}
        venueRow={selected}
        onOpenChange={setSheetOpen}
        onSubmit={handleSubmit}
        />
    </div>
  )
}
