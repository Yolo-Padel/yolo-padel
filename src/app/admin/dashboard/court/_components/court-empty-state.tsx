import { Target, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CourtEmptyStateProps {
  venueName?: string
}

export function CourtEmptyState({ venueName }: CourtEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Target className="w-12 h-12 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No courts found
      </h3>
      
      <p className="text-gray-500 text-center mb-6 max-w-md">
        {venueName 
          ? `No courts have been added to ${venueName} yet. Add courts to start managing bookings.`
          : "No courts have been added to this venue yet. Add courts to start managing bookings."
        }
      </p>
    </div>
  )
}