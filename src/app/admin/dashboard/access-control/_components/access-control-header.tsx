import { Badge } from "@/components/ui/badge";

export interface AccessControlHeaderProps {
  roleCount: number;
}

export function AccessControlHeader({ roleCount }: AccessControlHeaderProps) {
  return (
    <div className="flex items-center gap-2 justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">Access Control</h2>
        <Badge className="text-[#6941C6] bg-[#F9F5FF] border-[#E9D7FE] shadow-none rounded-4xl">
          {roleCount} {roleCount === 1 ? "role" : "roles"}
        </Badge>
      </div>
    </div>
  );
}
