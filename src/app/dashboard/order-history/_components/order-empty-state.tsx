
import { Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LandPlot } from "lucide-react"



export function OrderEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-24 h-24 flex items-center justify-center mb-6">
        <img src="/bag.svg" className="w-36 h-36" />
      </div>
      
      <h3 className="text-xl text-muted-foreground font-semibold mb-2">
        No Orders Yet
      </h3>
      
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        You haven't made any purchases yet. Your order history will appear here once you complete a payment.
      </p>

      {/*Button Book Court*/}
      <Button className="bg-primary mx-auto px-6 py-2">
        Book Court
        <LandPlot className="size-4" />
      </Button>
    </div>
  )
}