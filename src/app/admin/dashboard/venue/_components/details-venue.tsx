"use client"

import React from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { number } from 'zod'
import { Button } from '@/components/ui/button'


type DetailsVenue = {
  id: string
  venueName: string
  phoneNumber?: number
  address: string
  city: string
  openHour?: string
  closeHour?: string
}
export function EditVenueDetails({
    detailSheetOpen,
    onOpenChange,
    detailsVenue,
    onSubmit,
    onEditVenue,
    onDeleteVenue,
}: {
    detailSheetOpen: boolean
    onOpenChange: (v: boolean) => void
    detailsVenue: DetailsVenue | null
    onSubmit: (values: DetailsVenue) => Promise<void> | void
    onEditVenue?: () => void
    onDeleteVenue?: () => void
}) {

    const [values, setValues] = React.useState<DetailsVenue>({
      id: "",
      venueName: "",
      phoneNumber: 0,
      address: "",
      city: "",
      openHour: "07:00",
      closeHour: "23:00",
    })

    
    React.useEffect(() => {
      if (!detailSheetOpen) return 
      if (!detailsVenue) return
        setValues({
        id: detailsVenue.id,
        venueName: detailsVenue.venueName,
        phoneNumber: detailsVenue.phoneNumber,
        address: detailsVenue.address,
        city: detailsVenue.city,
        openHour: detailsVenue.openHour,
        closeHour: detailsVenue.closeHour,
      })
    }, [detailSheetOpen, detailsVenue])
      

  return (
    <Dialog open={detailSheetOpen} onOpenChange={() => onOpenChange(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold mb-6'>
            Details Venue
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full bg-[#C3D223] p-1 text-black hover:bg-[#A9B920]">  
          </DialogClose>
          {/* <DialogDescription> */}
            <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div className="text-muted-foreground">Venue Name</div>
            <div className="font-medium text-foreground min-w-0 truncate">{values.venueName || "-"}</div>

            <div className="text-muted-foreground">Phone Number</div>
            <div className="font-medium text-foreground min-w-0 truncate">{values.phoneNumber || "-"}</div>

            <div className="text-muted-foreground">Address</div>
            <div className="font-medium text-foreground min-w-0 truncate">{values.address || "-"}</div>

            <div className="text-muted-foreground">City</div>
            <div className="font-medium text-foreground min-w-0 truncate">{values.city || "-"}</div>

            <div className="text-muted-foreground">Operating Hours</div>
            <div className="font-medium text-foreground min-w-0 truncate">{values.openHour || "07:00"} - {values.closeHour || "23:00"}</div>
          </div>

          {/* </DialogDescription> */}
        </DialogHeader>
        <div className="mt-6 flex justify-center gap-3 rounded-b-sm">
            <Button 
              variant="outline" 
              className="rounded-xs flex-1" 
              onClick={() => { 
                if (onDeleteVenue) onDeleteVenue();
              }}
            >
              Delete Venue
            </Button>
            <Button 
              className="rounded-xs bg-[#C3D223] text-black hover:bg-[#A9B920] flex-1"
              onClick={() => {
                onOpenChange(false);
                if (onEditVenue) onEditVenue();
              }}
            >
              Edit Venue
            </Button>
          </div>
      </DialogContent>

    </Dialog>

      
  )
}
