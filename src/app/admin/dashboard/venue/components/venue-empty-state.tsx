import { Building2 } from "lucide-react"

export function VenueEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Building2 className="w-12 h-12 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No venues found
      </h3>
      
      <p className="text-gray-500 text-center mb-6 max-w-md">
        Get started by creating your first venue. You can add courts and manage bookings for each venue.
      </p>
    </div>
  )
}