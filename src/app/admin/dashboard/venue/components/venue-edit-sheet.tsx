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


type VenueRow = {
  id: string
  venueName: string
  descriptions: string
  address: string
  totalCourts: number
  image: File | null
  isActive: boolean
}


export function EditVenue ({
  open,
  onOpenChange,
  venueRow,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  venueRow: VenueRow | null
  onSubmit: (values: VenueRow) => Promise<void> | void
}) {

  const [values, setValues] = React.useState<VenueRow>({
    id: "",
    venueName: "",
    descriptions: "",
    address: "",
    totalCourts: 0,
    image: null,
    isActive: false,
  })

  function handleSave () {
    console.log("save")
  }

React.useEffect(() => {
  if (!open) return
  if (venueRow) {
    setValues({
      id: venueRow.id,
      venueName: venueRow.venueName,
      descriptions: venueRow.descriptions,
      address: venueRow.address,
      totalCourts: venueRow.totalCourts,
      image: venueRow.image,
      isActive: venueRow.isActive,
    })
  }
}, [venueRow])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline">Open</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Venue</SheetTitle>
          <SheetDescription>
            Make changes to your venue here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-name">VenueName</Label>
            <Input id="sheet-demo-name" placeholder="type venue name here" value={values.venueName} onChange={(e) => setValues({ ...values, venueName: e.target.value })} />
          </div>
          <div>
            <Label>Descriptions</Label>
            <Textarea id="venue-descriptions" placeholder="type descriptions venue here" value={values.descriptions} onChange={(e) => setValues({ ...values, descriptions: e.target.value })} />
          </div>
          <div>
            <Label>Address</Label>
            <Textarea id="venue-address" placeholder="type address venue here" value={values.address} onChange={(e) => setValues({ ...values, address: e.target.value })} />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-username">Total Courts</Label>
            <Input id="total-courts" type="number" placeholder="type total courts venue here" value={values.totalCourts} onChange={(e) => setValues({ ...values, totalCourts: Number(e.target.value) })} />
          </div>
          <div>
            <Label htmlFor="picture">Image</Label>
            <Input id="picture" type="file" onChange={(e) => setValues({ ...values, image: e.target.files?.[0] || null })} />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-username">Is Active</Label>
            <Switch id="sheet-demo-username" checked={values.isActive} onCheckedChange={(checked) => setValues({ ...values, isActive: checked })} />
          </div>
        </div>
        <SheetFooter>
          <Button type="submit" onClick={handleSave}>Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
