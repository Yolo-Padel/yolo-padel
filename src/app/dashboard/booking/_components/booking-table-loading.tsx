import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LandPlot } from "lucide-react";
import { ComboboxFilter } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Card } from "@/components/ui/card";

export default function BookingTableLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-1">
        <h3 className="text-xl font-semibold ">Booking Court List</h3>
        <div className="flex items-center gap-2">
            <DatePicker disabled />
            <ComboboxFilter disabled />

          <Button
            variant="outline"
            className="text-black"
            disabled
          >
            Book Court
            <LandPlot className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
      {Array.from({length: 5}).map((_, index) => (
      <Card className="min-w-0 max-w-[265px] shadow-lg hover:shadow-xl transition-shadow duration-300 p-1 gap-2 border-[1px] border-foreground" key={index}>
        <CardHeader className="p-2">
            <Skeleton className="w-full h-32 rounded-sm" />
        </CardHeader>
        <CardContent className="px-2 pt-0 pb-1 text-md text-gray-700 gap-2 space-y-2">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/4 mb-2" />
          <Skeleton className="h-4 w-1/3 mb-2" />
        </CardContent>
        <CardFooter className="px-1 pt-0 pb-1 w-full min-w-0 grid grid-cols-2 gap-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardFooter>
      </Card>
      ))}
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}