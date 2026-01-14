import { Badge } from "@/components/ui/badge";

export interface UserHeaderProps {
  userCount: number;
}

export function UserHeader({ userCount }: UserHeaderProps) {
  return (
    <div className="flex items-center gap-2 justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">Staff List</h2>
        <Badge className="text-[#6941C6] bg-[#F9F5FF] border-[#E9D7FE] shadow-none rounded-4xl">
          {userCount} {userCount === 1 ? "staff" : "staff"}
        </Badge>
      </div>
    </div>
  );
}
