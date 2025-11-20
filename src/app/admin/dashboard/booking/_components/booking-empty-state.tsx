import { Calendar, Search } from "lucide-react";

interface BookingEmptyStateProps {
  isFiltered: boolean;
}

export function BookingEmptyState({ isFiltered }: BookingEmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Search className="w-12 h-12 text-gray-400" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No bookings found
        </h3>

        <p className="text-gray-500 text-center mb-6 max-w-md">
          No bookings match your search criteria. Try adjusting your filters or
          search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Calendar className="w-12 h-12 text-gray-400" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No bookings yet
      </h3>

      <p className="text-gray-500 text-center mb-6 max-w-md">
        No bookings have been made yet. Bookings will appear here once customers
        start making reservations.
      </p>
    </div>
  );
}
