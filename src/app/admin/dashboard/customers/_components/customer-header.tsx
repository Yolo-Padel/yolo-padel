import { Badge } from "@/components/ui/badge";

export interface CustomerHeaderProps {
  customerCount: number;
}

export function CustomerHeader({ customerCount }: CustomerHeaderProps) {
  return (
    <div className="flex items-center gap-2 justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">Customer List</h2>
        <Badge className="text-[#6941C6] bg-[#F9F5FF] border-[#E9D7FE] shadow-none rounded-4xl">
          {customerCount} {customerCount === 1 ? "customer" : "customers"}
        </Badge>
      </div>
    </div>
  );
}
