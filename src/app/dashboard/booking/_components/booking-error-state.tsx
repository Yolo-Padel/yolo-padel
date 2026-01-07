"use client";

interface BookingErrorStateProps {
  message: string;
}

/**
 * Pure presentational component for error state
 */
export function BookingErrorState({ message }: BookingErrorStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="text-red-500 mb-2">Error loading bookings</div>
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
}
