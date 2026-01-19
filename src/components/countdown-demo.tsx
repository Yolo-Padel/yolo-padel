/**
 * Demo component to showcase the countdown functionality
 * This can be used for testing and demonstration purposes
 * Format: "2 hours 35 minutes" or "1 hour 1 minute" or "15 minutes" or "Less than 1 minute"
 */

"use client";

import React from "react";
import { useCountdown } from "@/hooks/use-countdown";
import { createBookingStartDateTime } from "@/lib/booking-time-utils";
import { Clock } from "lucide-react";

interface CountdownDemoProps {
  bookingDate: string;
  bookingTime: string;
  label?: string;
}

export function CountdownDemo({
  bookingDate,
  bookingTime,
  label = "Game starts in",
}: CountdownDemoProps) {
  const targetDateTime = createBookingStartDateTime(bookingDate, bookingTime);
  const { timeLeft, isExpired } = useCountdown(targetDateTime);

  if (!targetDateTime) {
    return (
      <div className="text-red-500 text-sm">Invalid booking time format</div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 border rounded-lg">
      <Clock className="w-4 h-4" />
      <span className="text-sm">{label}:</span>
      <span
        className={`font-mono font-medium ${
          isExpired ? "text-green-600" : "text-blue-600"
        }`}
      >
        {timeLeft}
      </span>
    </div>
  );
}

// Example usage component
export function CountdownExamples() {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const futureHour = (now.getHours() + 2) % 24;
  const futureTime = `${futureHour.toString().padStart(2, "0")}.00–${((futureHour + 2) % 24).toString().padStart(2, "0")}.00`;

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Countdown Examples</h3>

      <CountdownDemo
        bookingDate={today}
        bookingTime={futureTime}
        label="Next booking"
      />

      <CountdownDemo
        bookingDate={today}
        bookingTime="23.59–23.59"
        label="End of day"
      />

      <CountdownDemo
        bookingDate="2024-12-31"
        bookingTime="23.59–00.00"
        label="New Year"
      />
    </div>
  );
}
