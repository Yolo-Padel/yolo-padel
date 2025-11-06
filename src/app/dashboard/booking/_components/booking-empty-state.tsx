import { Building2 } from "lucide-react"

export function BookingEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-24 h-24 flex items-center justify-center mb-6">
        <img src="./search.svg" className="w-36 h-36" />
      </div>
      
      <h3 className="text-xl text-muted-foreground font-semibold mb-2">
        No booking courts found
      </h3>
      
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        Get started by creating your first booking court. You can add courts and manage bookings for each court.
      </p>
    </div>
  )
}