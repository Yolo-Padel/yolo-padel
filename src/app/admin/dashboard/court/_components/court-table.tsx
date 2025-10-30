"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
  Trash,
} from "lucide-react"
import { CourtModal } from "./court-modal"
import { CourtDeleteModal } from "./court-delete-modal"
import {
  generatePageNumbers,
  calculatePaginationInfo,
  getPaginatedData,
} from "@/lib/pagination-utils"
import { Breadcrumb, BreadcrumbLink, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { useCourtByVenue } from "@/hooks/use-court"
import { useVenueById } from "@/hooks/use-venue"
import { Court as PrismaCourt, OpeningHoursType } from "@/types/prisma"
import { CourtTableSkeleton } from "@/app/admin/dashboard/court/_components/court-skeleton"
import { CourtEmptyState } from "@/app/admin/dashboard/court/_components/court-empty-state"

// Types
type Court = {
  id: string
  courtName: string
  status: string // reflected from availability field
  pricePerHour: number
  availability: boolean
  availabilityTime: string
  openingHours?: OpeningHoursType
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
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [courtToDelete, setCourtToDelete] = useState<Court | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get venueId from query params
  const venueId = searchParams.get('venueId')
  
  // Fetch courts by venue
  const { data: courtData, isLoading, error } = useCourtByVenue(venueId || '')
  
  // Fetch venue details for breadcrumb
  const { data: venueData } = useVenueById(venueId || '')
  
  // Transform Prisma Court data to match our Court type
  const courts: Court[] = useMemo(() => {
    if (!courtData?.data) return []
    
    return (courtData.data as PrismaCourt[]).map((court) => ({
      id: court.id,
      courtName: court.name,
      status: court.isActive ? "Available" : "Unavailable",
      pricePerHour: court.price || 0,
      availability: court.isActive,
      availabilityTime: "09:00 - 21:00", // Default time, can be enhanced later
      openingHours: court.openingType,
    }))
  }, [courtData])

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
    // TODO: Implement API call to toggle court availability
    console.log(`Court ${courtId} availability changed to:`, checked)
  }

  // Function to handle delete court
  const handleDeleteCourt = (court: Court) => {
    setCourtToDelete(court)
    setDeleteModalOpen(true)
  }

  // Function to handle delete success
  const handleDeleteSuccess = () => {
    setCourtToDelete(null)
    // The useCourtByVenue hook will automatically refetch data
  }

  async function handleSubmit() {
    // Dummy submit: console log value
    console.log("")
  }

  // Show loading state
  if (isLoading) {
    return (
        <CourtTableSkeleton />
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard/venue">Venue Management</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/dashboard/court" className="text-primary hover:text-primary/80">
                {venueData?.data?.name || 'Court Management'}
              </BreadcrumbLink>
            </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
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
    )
  }

  // Show empty state
  // if (courts.length === 0) {
  //   return (
  //     <div className="flex flex-col gap-4">
  //       <div className="flex items-center gap-2 justify-between">
  //         <Breadcrumb>
  //           <BreadcrumbList>
  //             <BreadcrumbItem>
  //               <BreadcrumbLink href="/admin/dashboard/venue">Venue Management</BreadcrumbLink>
  //             </BreadcrumbItem>
  //             <BreadcrumbSeparator>/</BreadcrumbSeparator>
  //             <BreadcrumbItem>
  //               <BreadcrumbLink href="/admin/dashboard/court" className="text-primary hover:text-primary/80">Court Management</BreadcrumbLink>
  //             </BreadcrumbItem>
  //           </BreadcrumbList>
  //         </Breadcrumb>
  //       </div>
  //       <Button
  //         onClick={() => setSheetOpen(true)}
  //         className="text-black"
  //       >
  //         Add Court
  //         <Plus className="ml-2 size-4" />
  //       </Button>
  //       <CourtEmptyState 
  //         onAddCourt={() => setSheetOpen(true)}
  //         venueName={courtData?.data?.[0]?.venue?.name}
  //       />
  //     </div>
  //   )
  // }

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
              <BreadcrumbLink href="/admin/dashboard/court" className="text-primary hover:text-primary/80">
                {venueData?.data?.name || 'Court Management'}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
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
      )}
      <CourtModal
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={modalMode}
        venueId={venueId || ''}
        venueName={venueData?.data?.name || 'Unknown Venue'}
        court={selected ? (() => {
          console.log("Selected court for modal:", selected);
          console.log("Selected pricePerHour:", selected.pricePerHour);
          console.log("Selected openingHours:", selected.openingHours);
          return {
            id: selected.id,
            name: selected.courtName,
            price: selected.pricePerHour,
            openingHours: selected.openingHours || OpeningHoursType.REGULAR
          };
        })() : undefined}
      />
      
      <CourtDeleteModal
        deleteModalOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        courtData={courtToDelete ? {
          id: courtToDelete.id,
          name: courtToDelete.courtName,
          price: courtToDelete.pricePerHour
        } : null}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}