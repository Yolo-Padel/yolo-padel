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
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import React, { useEffect } from 'react'
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { venueFormSchema, VenueFormData } from "@/lib/validations/venue.validation"
import { FileUploader } from "@/components/file-uploader"
import { useCreateVenue, useUpdateVenue } from "@/hooks/use-venue"

type VenueFormValues = VenueFormData

export function VenueFormSheet ({
  open,
  onOpenChange,
  venueData,
  mode = "create",
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  venueData: Partial<VenueFormValues> | null
  mode?: "create" | "edit"
}) {

  const createMutation = useCreateVenue()
  const updateMutation = useUpdateVenue()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<VenueFormValues>({
    resolver: zodResolver(venueFormSchema) as any,
    defaultValues: {
      id: undefined,
      name: "",
      address: "",
      description: "",
      images: undefined,
      city: "",
      phone: "",
      isActive: true,
    },
  })

  useEffect(() => {
    if (!open) return
    
    if (mode === "edit" && venueData) {
      reset({
        id: venueData.id,
        name: venueData.name ?? "",
        address: venueData.address ?? "",
        description: (venueData as any).description ?? "",
        images: (venueData as any).images ?? [],
        city: (venueData as any).city ?? "",
        phone: (venueData as any).phone ?? "",
        isActive: (venueData as any).isActive ?? true,
      })
    } else if (mode === "create") {
      reset({
        id: undefined,
        name: "",
        address: "",
        description: "",
        images: [],
        city: "",
        phone: "",
        isActive: true,
      })
    }
  }, [open, mode, reset])

  const onSubmit: SubmitHandler<VenueFormValues> = async (values) => {
    if (mode === "edit" && values.id) {
      await updateMutation.mutateAsync({
        venueId: values.id,
        name: values.name,
        address: values.address,
        description: values.description,
        images: values.images ?? [],
        city: values.city,
        phone: values.phone,
        isActive: values.isActive,
      })
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        address: values.address,
        description: values.description,
        images: values.images ?? [],
        city: values.city,
        phone: values.phone,
        isActive: values.isActive,
      })
    }
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 w-[600px] sm:w-[540px] h-full">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>{mode === "edit" ? "Edit Venue" : "Add New Venue"}</SheetTitle>
          <SheetDescription>
            {mode === "edit" ? "Update venue details here." : "Add new venue details here."}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit(onSubmit as SubmitHandler<any>)} className="space-y-6">
            <div className="grid gap-2">
              <Label>Venue Name <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Slipi Padel Center" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Phone Number (Optional)</Label>
              <Input type="tel" placeholder="e.g. 08325252908" {...register("phone")} />
            </div>
            <div className="grid gap-2">
              <Label>Address <span className="text-red-500">*</span></Label>
              <Textarea placeholder="e.g. Jl. Raya Bogor No. 123" {...register("address")} />
            </div>
            <div className="grid gap-2">
              <Label>City <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Jakarta" {...register("city")} />
            </div>
            <div className="grid gap-2">
              <Label>Photo Venue (Optional)</Label>
              <FileUploader
                multiple
                maxFiles={5}
                value={(watch("images") as string[] | undefined) ?? []}
                onChange={(urls) => setValue("images", urls)}
              />
            </div>
          </form>
        </div>
        
        <SheetFooter className="px-6 py-4 border-t bg-background">
          <div className="flex justify-between gap-2 w-full">
            <SheetClose asChild>
              <Button className="w-1/2 text-black font-normal" variant="outline">Close</Button>
            </SheetClose>
            <Button 
              className="w-1/2 text-black font-normal" 
              type="submit" 
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit as SubmitHandler<any>)}
            >
              {isSubmitting ? (mode === "edit" ? "Saving..." : "Adding...") : (mode === "edit" ? "Save Changes" : "Add Venue")}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
