import React from "react";

import BookingConfirmationEmail from "@/components/emails/booking-confirmation";

export default function page() {
  return (
    <div>
      
      <BookingConfirmationEmail email="johndoe@examples.com" customerName="John Doe" court="Court 1" date={new Date()} time="10:00" player={2} location="Yolo Padel Lebak Bulus" />
      
    </div>
  );
}
