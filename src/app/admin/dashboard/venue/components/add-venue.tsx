"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import React from 'react'


type VenueData = {
  id: string
  venueName: string
  phoneNumber?: number
  address: string
  city: string
  photoVenue: File | null
  admin: string
}


export function AddVenue ({
  open,
  onOpenChange,
  venueData,
  onSubmit,

}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  venueData: VenueData | null
  onSubmit: (values: VenueData) => Promise<void> | void
}) {

  const [values, setValues] = React.useState<VenueData>({
    id: "",
    venueName: "",
    phoneNumber: undefined,
    address: "",
    city: "",
    photoVenue: null,
    admin: "",    
  })

  function handleSave () {
    console.log("save")
  }

React.useEffect(() => {
  if (!open) return
  if (venueData) {
    setValues({
      id: venueData.id,
      venueName: venueData.venueName,
      phoneNumber: venueData.phoneNumber,
      address: venueData.address,
      city: venueData.city,
      photoVenue: venueData.photoVenue,
      admin: venueData.admin,
    })
  }
}, [venueData])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-1 w-[600px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Add New Venue</SheetTitle>
          <SheetDescription>
            Add new venue details here.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-2">
            <Label>Venue Name*</Label>
            <Input placeholder="type venue name here" value={values.venueName} onChange={(e) => setValues({ ...values, venueName: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Phone Number*</Label>
            <Input type="tel" placeholder="08325252908" value={values.phoneNumber} onChange={(e) => setValues({ ...values, phoneNumber: Number(e.target.value) })} />
          </div>
          <div className="grid gap-2">
            <Label>Address*</Label>
            <Textarea placeholder="type address venue here" value={values.address} onChange={(e) => setValues({ ...values, address: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>City*</Label>
            <Input placeholder="jakarta" value={values.city} onChange={(e) => setValues({ ...values, city: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Image*</Label>
            <Input type="file" onChange={(e) => setValues({ ...values, photoVenue: e.target.files?.[0] || null })} />
          </div>
        </div>
        <SheetFooter >
          <div className="flex justify-between gap-2">
          <SheetClose asChild>
            <Button className="w-1/2 text-black font-normal" variant="outline">Close</Button>
          </SheetClose>
          <Button className="w-1/2 text-black font-normal" type="submit" onClick={handleSave}>Add Venue</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
