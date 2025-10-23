"use client"

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { number } from 'zod'


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
      


  return (
    <Dialog open={detailSheetOpen} onOpenChange={() => onOpenChange(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold mb-6'>
            Details Venue
          </DialogTitle>
          <DialogDescription>
            <div className='space-y-2'>
                <div>
                    <span className="font-sans text-black text-lg">Venue Name:</span> {values.venueName}
                </div>
                <div>
                    <span className="font-sans text-black text-lg">Phone Number:</span> {values.phoneNumber || "No Phone Number"}
                </div>
                <div>
                    <span className="font-sans text-black text-lg">Address:</span> {values.address}
                </div>
                <div>
                    <span className="font-sans text-black text-lg">City:</span> {values.city}
                </div>
                <div>
                    <span className="font-sans text-black text-lg">Admin:</span> {values.admin}
                </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
