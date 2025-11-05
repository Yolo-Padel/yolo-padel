"use client"

import { BookingCourt } from "@/app/dashboard/booking/_components/booking-court";
import { useState } from "react";

export default function BookingPage() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <BookingCourt open={open} onOpenChange={setOpen} />
    </div>
  )
}