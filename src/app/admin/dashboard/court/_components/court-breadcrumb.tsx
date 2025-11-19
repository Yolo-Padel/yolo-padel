import { ArrowLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type CourtBreadcrumbProps = {
  venueName?: string;
};

export function CourtBreadcrumb({ venueName }: CourtBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            href="/admin/dashboard/venue"
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Venue Management
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink
            href="/admin/dashboard/court"
            className="text-primary hover:text-primary/80"
          >
            {venueName || "Court Management"}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
