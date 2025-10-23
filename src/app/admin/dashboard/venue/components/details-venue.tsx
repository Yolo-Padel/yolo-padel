"use client"

import React from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { number } from 'zod'
import { Button } from '@/components/ui/button'
import { DeleteVenue } from './venue-delete'


type DetailsVenue = {
  id: string
  venueName: string
  phoneNumber?: number
  address: string
  city: string
  admin: string
}
export function EditVenueDetails({
    detailSheetOpen,
    onOpenChange,
    detailsVenue,
    onSubmit,
}: {
    detailSheetOpen: boolean
    onOpenChange: (v: boolean) => void
    detailsVenue: DetailsVenue | null
    onSubmit: (values: DetailsVenue) => Promise<void> | void
}) {

    const [values, setValues] = React.useState<DetailsVenue>({
      id: "",
      venueName: "",
      phoneNumber: 0,
      address: "",
      city: "",
      admin: "",
    })

    const [deleteSheetOpen,setDeleteSheetOpen] = React.useState(false)
    
    React.useEffect(() => {
      if (!detailSheetOpen) return 
      if (!detailsVenue) return
        setValues({
        id: detailsVenue.id,
        venueName: detailsVenue.venueName,
        phoneNumber: detailsVenue.phoneNumber,
        address: detailsVenue.address,
        city: detailsVenue.city,
        admin: detailsVenue.admin,
      })
    }, [detailSheetOpen, detailsVenue])
      
    async function handleDeleteVenue () {
      setDeleteSheetOpen(false)
    }

  return (
    <Dialog open={detailSheetOpen} onOpenChange={() => onOpenChange(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold mb-6'>
            Details Venue
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full bg-[#C3D223] p-1 text-black hover:bg-[#A9B920] ">  
          </DialogClose>
          <DialogDescription>
            <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div className="text-muted-foreground">Venue Name</div>
            <div className="font-medium text-foreground min-w-0 truncate">{values.venueName || "-"}</div>

            <div className="text-muted-foreground">Phone Number</div>
            <div className="font-medium text-foreground min-w-0 truncate">{values.phoneNumber || "-"}</div>

            <div className="text-muted-foreground">Address</div>
            <div className="font-medium text-foreground min-w-0 truncate">{values.address || "-"}</div>

            <div className="text-muted-foreground">City</div>
            <div className="font-medium text-foreground min-w-0 truncate">{values.city || "-"}</div>

            <div className="text-muted-foreground">Admin</div>
            <div className="font-medium text-foreground min-w-0 truncate">{values.admin || "-"}</div>
          </div>

          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-center gap-3 rounded-b-sm">
            <Button variant="outline" className="rounded-xs flex-1" onClick={() => { setDeleteSheetOpen(true); }}>
              Delete Venue
            </Button>
            <Button className="rounded-xs bg-[#C3D223] text-black hover:bg-[#A9B920] flex-1">
              Edit Venue
            </Button>
          </div>
      </DialogContent>

      <DeleteVenue
        deleteSheetOpen={deleteSheetOpen}
        onOpenChange={setDeleteSheetOpen}
        onSubmit={handleDeleteVenue}
      />
    </Dialog>

      
  )
}
