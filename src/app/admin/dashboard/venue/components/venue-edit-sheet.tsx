"use client"

import * as React from "react"
import { z } from "zod"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const schema = z.object({
  venuename: z.string().min(2).max(32).optional().or(z.literal("")),
  location: z.string().min(2).max(32).optional().or(z.literal("")),
  totalCourts: z.number().int().min(1).max(100),
  openingHours: z.string().min(2).max(32).optional().or(z.literal("")),
  admin: z.string().email().optional().or(z.literal("")),
  status: z.enum(["Available", "Fully Booked", "Under Maintenance"]),
})

type VenueRow = {
  venuename: string
  location: string
  totalCourts: number
  openingHours: string
  admin: string
  status: "Available" | "Fully Booked" | "Under Maintenance"
  
}

export function VenueEditSheet({
  open,
  onOpenChange,
  venue,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  venue: VenueRow | null
  onSubmit: (values: z.infer<typeof schema>) => Promise<void> | void
}) {
  const [values, setValues] = React.useState<z.infer<typeof schema>>({
    venuename: "",
    location: "",
    totalCourts: 0,
    openingHours: "",
    admin: "",
    status: "Available",
  })
  const [errors, setErrors] = React.useState<Partial<Record<keyof z.infer<typeof schema>, string>>>({})
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    if (venue) {
      setValues({
        
        venuename: venue.venuename ?? "",
        location: venue.location ?? "",
        totalCourts: venue.totalCourts,
        openingHours: venue.openingHours ?? "",
        admin: venue.admin ?? "",
        status: venue.status,
      })
      setErrors({})
    }
  }, [open, venue])

  function handleChange<K extends keyof z.infer<typeof schema>>(key: K, val: z.infer<typeof schema>[K]) {
    setValues((v) => ({ ...v, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as keyof z.infer<typeof schema>
        fieldErrors[path] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    try {
      setSubmitting(true)
      await onSubmit(parsed.data)
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  const fullName = [values.venuename, values.location].filter(Boolean).join(" ") || "-"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-4 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Venue</SheetTitle>
          <SheetDescription>
            Update data user dan profile. Perubahan ini hanya dummy pada sisi UI.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 px-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Venue Name</label>
            <Input
              value={values.venuename}
              onChange={(e) => handleChange("venuename", e.target.value)}
              type="text"
              placeholder="Venue Name"
            />
            {errors.venuename && <p className="text-destructive mt-1 text-xs">{errors.venuename}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Location</label>
            <Input
              value={values.location ?? ""}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="Location"
            />
            {errors.location && <p className="text-destructive mt-1 text-xs">{errors.location}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Total Courts</label>
              <Input
                value={values.totalCourts}
                onChange={(e) => handleChange("totalCourts", Number(e.target.value))}
                type="number"
                placeholder="Total Courts"
              />
              {errors.totalCourts && <p className="text-destructive mt-1 text-xs">{errors.totalCourts}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Opening Hours</label>
              <Input
                value={values.openingHours ?? ""}
                onChange={(e) => handleChange("openingHours", e.target.value)}
                placeholder="Opening Hours"
              />
              {errors.openingHours && <p className="text-destructive mt-1 text-xs">{errors.openingHours}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Role</label>
              <select
                className={cn(
                  "bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring text-sm",
                  "border-input focus-visible:ring-2 flex h-9 w-full rounded-md border px-3 py-1",
                )}
                value={values.status}
                onChange={(e) => handleChange("status", e.target.value as "Available")}
              >
                <option value="Available">Available</option>
                <option value="Fully Booked">Fully Booked</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
              {errors.status && <p className="text-destructive mt-1 text-xs">{errors.status}</p>}
            </div>
            <div className="flex items-end gap-2">
              <Badge variant="secondary">{fullName}</Badge>
            </div>
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              Save changes
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
