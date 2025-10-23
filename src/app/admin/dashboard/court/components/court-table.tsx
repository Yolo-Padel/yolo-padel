"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table"
import {
  Pencil,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react"
import { CourtEditSheet } from "./court-edit-sheet"
import {
  generatePageNumbers,
  calculatePaginationInfo,
  getPaginatedData,
} from "@/lib/pagination-utils"
import { Breadcrumb, BreadcrumbLink, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

// Types
type Court = {
  id: string
  courtName: string
  status: string // reflected from availability field
  pricePerHour: number
  availability: boolean
  availabilityTime: string
}

const DUMMY_DATA: Court[] = [
  {
    id: "A12QCxxxxx",
    courtName: "Court 1",
    status: "Available",
    pricePerHour: 150000,
    availability: true,
    availabilityTime: "09:00 - 21:00",
  },
  {
    id: "S12QCxxxxx",
    courtName: "Court 2",
    status: "Booked",
    pricePerHour: 175000,
    availability: false,
    availabilityTime: "10:00 - 22:00",
  },
  {
    id: "C12QCxxxxx",
    courtName: "Court 3",
    status: "Available",
    pricePerHour: 200000,
    availability: true,
    availabilityTime: "08:00 - 20:00",
  },
  {
    id: "D12QCxxxxx",
    courtName: "Court 4",
    status: "Maintenance",
    pricePerHour: 160000,
    availability: false,
    availabilityTime: "09:00 - 21:00",
  },
  {
    id: "E12QCxxxxx",
    courtName: "Court 5",
    status: "Available",
    pricePerHour: 180000,
    availability: true,
    availabilityTime: "07:00 - 23:00",
  },
]

const PAGE_SIZE = 10

export function CourtTable() {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Court | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [courts, setCourts] = useState<Court[]>(DUMMY_DATA)
  const searchParams = useSearchParams()

  // Define table columns for colSpan
  const columns = [
    "Court Name",
    "Status",
    "Price (Hour)",
    "Availability",
    "Availability Time",
    "Actions",
  ]

  // Frontend filtering and pagination
  const filtered = useMemo(() => {
    const searchQuery = searchParams.get("search")?.toLowerCase().trim()
    
    if (!searchQuery) {
      return courts
    }

    return courts.filter((court: Court) => {
      const courtName = court.courtName.toLowerCase()
      const status = court.status.toLowerCase()
      const price = court.pricePerHour.toString()
      const availability = court.availability ? "available" : "unavailable"
      const availabilityTime = court.availabilityTime.toLowerCase()
      
      return (
        courtName.includes(searchQuery) ||
        status.includes(searchQuery) ||
        price.includes(searchQuery) ||
        availability.includes(searchQuery) ||
        availabilityTime.includes(searchQuery)
      )
    })
  }, [courts, searchParams])

  const paginationInfo = useMemo(
    () => calculatePaginationInfo(page, filtered.length, PAGE_SIZE),
    [page, filtered.length]
  );

  const paginated = useMemo(
    () => getPaginatedData(filtered, page, PAGE_SIZE),
    [filtered, page]
  );

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1)
  }, [searchParams])

  // Function to handle availability toggle
  const handleAvailabilityToggle = (courtId: string, checked: boolean) => {
    setCourts(prevCourts => 
      prevCourts.map(court => 
        court.id === courtId 
          ? { 
              ...court, 
              availability: checked,
              status: checked ? "Available" : "Unavailable"
            }
          : court
      )
    )
    console.log(`Court ${courtId} availability changed to:`, checked)
  }

  async function handleSubmit() {
    // Dummy submit: console log value
    console.log("")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/dashboard/venue">Venue Management</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              /
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/dashboard/court" className="text-primary hover:text-primary/80">Court Management</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button
          onClick={() => setSheetOpen(true)}
          className="text-black"
        >
          Add Court
          <Plus className="ml-2 size-4" />
        </Button>
      </div>

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
                  <TableCell className="font-medium">{court.courtName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          court.status === "Available" ? "bg-green-500" :
                          court.status === "Booked" ? "bg-red-500" :
                          court.status === "Maintenance" ? "bg-yellow-500" :
                          "bg-gray-500"
                        }`} />
                        {court.status}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      Rp {court.pricePerHour.toLocaleString('id-ID')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={court.availability}
                        onCheckedChange={(checked: boolean) => {
                          handleAvailabilityToggle(court.id, checked)
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>{court.availabilityTime}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelected(court);
                        setSheetOpen(true);
                      }}
                      className="border-none shadow-none"
                    >
                      <Pencil className="size-4 text-[#A4A7AE]" />
                    </Button>
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
                          <div className="flex items-center justify-center w-8 h-8 text-muted-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </div>
                        ) : (
                          <Button
                            variant={
                              pageNum === paginationInfo.pageSafe
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setPage(pageNum as number)}
                            className="w-8 h-8 p-0"
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
                      setPage((p) => Math.min(paginationInfo.totalPages, p + 1))
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

      <CourtEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        court={selected as any}
        onSubmit={handleSubmit}
      />
    </div>
  )
}