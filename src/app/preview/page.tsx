import React from "react";

import BookingConfirmationEmail from "@/components/emails/booking-confirmation";
import BookingRescheduleEmail from "@/components/emails/booking-reschedule";
import BookingCancelationEmail from "@/components/emails/booking-cancelation";
import ResetPasswordEmail from "@/components/emails/reset-password";

export default function page() {
  return (
    <div>
      <BookingCancelationEmail customerName="John Doe" court="Court 1" date={new Date()} time="10:00" bookingId="6879xbfury" location="Yolo Padel Lebak Bulus" status="Canceled" />
      <BookingConfirmationEmail customerName="John Doe" court="Court 1" date={new Date()} time="10:00" bookingId="6879xbfury" location="Yolo Padel Lebak Bulus" />
      <BookingRescheduleEmail customerName="John Doe" court="Court 1" date={new Date()} time="10:00" bookingId="6879xbfury" location="Yolo Padel Lebak Bulus" status="Rescheduled" />
      <ResetPasswordEmail customerName="John Doe" email="johndoe@examples.com" resetUrl="https://yolo-padel.vercel.app/reset-password" />
    </div>
  );
}
