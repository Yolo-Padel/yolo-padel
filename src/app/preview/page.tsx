"use client";

import { BookingForm } from "../dashboard/_components/booking-form";

export default function PreviewPage() {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="space-y-4 w-full max-w-[552px]">
        <BookingForm onClose={() => {}} isModal={true} />
      </div>
    </div>
  );
}
