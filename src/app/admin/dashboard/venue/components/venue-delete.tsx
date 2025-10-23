"use client"

import React from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { number } from 'zod'
import { Button } from '@/components/ui/button'


export function DeleteVenue({
    deleteSheetOpen,
    onOpenChange,
    onSubmit,

}: {
    deleteSheetOpen: boolean
    onOpenChange: (v: boolean) => void
    onSubmit: () => Promise<void> | void
}) {
    
  return (
    <Dialog open={deleteSheetOpen} onOpenChange={() => onOpenChange(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold mb-6'>
            Delete Venue
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full bg-[#C3D223] p-1 text-black hover:bg-[#A9B920] ">  
          </DialogClose>
          <DialogDescription>
            <p className="justify-center">
              Deleting this venue will permanently remove it from your dashboard, including all related courts,bookings, and reports. 
              Please make sure there are no pending bookings before you continue.</p>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-center gap-3 rounded-b-sm">
          <Button variant="outline" className="rounded-xs flex-1">
            Cancel
          </Button>
          <Button className="rounded-xs bg-[#D93206] text-black hover:bg-[#B32805] flex-1">
            Delete Venue
          </Button>
          </div>
      </DialogContent>
    </Dialog>
  )
}
