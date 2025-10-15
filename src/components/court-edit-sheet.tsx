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
  courtName: z.string().min(1).max(64),
  courtType: z.enum(["INDOOR", "OUTDOOR"]),
  courtVenue: z.enum(["Court Paddle Lebak Bulus", "Court Paddle PIK", "Court Paddle Kemang"]),
  status: z.enum(["Available", "Booked", "Re-Schedule", "Cancel"]),
})

type CourtType = "INDOOR" | "OUTDOOR"
type CourtVenue = "Court Paddle Lebak Bulus" | "Court Paddle PIK" | "Court Paddle Kemang"
type Status = "Available" | "Booked" | "Re-Schedule" | "Cancel"
type Court = {
  courtName: string
  courtType: CourtType
  venue: CourtVenue
  status: Status
}

export function CourtEditSheet({
  open,
  onOpenChange,
  court,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  court: Court | null
  onSubmit: (values: z.infer<typeof schema>) => Promise<void> | void
}) {
  const [values, setValues] = React.useState<z.infer<typeof schema>>({
    courtName: court?.courtName ?? "",
    courtType: court?.courtType ?? "INDOOR",
    courtVenue: court?.venue ?? "Court Paddle Lebak Bulus",
    status: court?.status ?? "Available",
  })
  const [errors, setErrors] = React.useState<Partial<Record<keyof z.infer<typeof schema>, string>>>({})
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    if (court) {
      setValues({
        courtName: court.courtName,
        courtType: court.courtType,
        courtVenue: court.venue,
        status: court.status,
      })
      setErrors({})
    }
  }, [open, court])

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-4 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Court</SheetTitle>
          <SheetDescription>
            Update data court. Perubahan ini hanya dummy pada sisi UI.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 px-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Court Name</label>
            <Input
              value={values.courtName}
              onChange={(e) => handleChange("courtName", e.target.value)}
              type="text"
              placeholder="Court Name"
            />
            {errors.courtName && <p className="text-destructive mt-1 text-xs">{errors.courtName}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Court Type</label>
            <select
              className={cn(
                "bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring text-sm",
                "border-input focus-visible:ring-2 flex h-9 w-full rounded-md border px-3 py-1",
              )}
              value={values.courtType}
              onChange={(e) => handleChange("courtType", e.target.value as CourtType)}
            >
              <option value="INDOOR">INDOOR</option>
              <option value="OUTDOOR">OUTDOOR</option>
            </select>
            {errors.courtType && <p className="text-destructive mt-1 text-xs">{errors.courtType}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Court Venue</label>
            <select
              className={cn(
                "bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring text-sm",
                "border-input focus-visible:ring-2 flex h-9 w-full rounded-md border px-3 py-1",
              )}
              value={values.courtVenue}
              onChange={(e) => handleChange("courtVenue", e.target.value as CourtVenue)}
            >
              <option value="Court Paddle Lebak Bulus">Court Paddle Lebak Bulus</option>
              <option value="Court Paddle PIK">Court Paddle PIK</option>
              <option value="Court Paddle Kemang">Court Paddle Kemang</option>
            </select>
            {errors.courtVenue && <p className="text-destructive mt-1 text-xs">{errors.courtVenue}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select
              className={cn(
                "bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring text-sm",
                "border-input focus-visible:ring-2 flex h-9 w-full rounded-md border px-3 py-1",
              )}
              value={values.status}
              onChange={(e) => handleChange("status", e.target.value as Status)}
            >
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Re-Schedule">Re-Schedule</option>
              <option value="Cancel">Cancel</option>
            </select>
            {errors.status && <p className="text-destructive mt-1 text-xs">{errors.status}</p>}
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