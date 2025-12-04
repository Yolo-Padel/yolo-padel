import { useVenue } from "@/hooks/use-venue";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Venue } from "@/types/prisma";

interface AdminDashboardFiltersProps {
  venueFilter: string;
  onVenueChange: (value: string) => void;
}

export function AdminDashboardFilters({
  venueFilter,
  onVenueChange,
}: AdminDashboardFiltersProps) {
  const { data: venuesData } = useVenue();

  return (
    <div className="flex items-center gap-4">
      <Select value={venueFilter} onValueChange={onVenueChange}>
        <SelectTrigger>
          <SelectValue placeholder="All venue" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All venue</SelectItem>
          {venuesData?.data?.map((venue: Venue) => (
            <SelectItem key={venue.id} value={venue.id}>
              {venue.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
