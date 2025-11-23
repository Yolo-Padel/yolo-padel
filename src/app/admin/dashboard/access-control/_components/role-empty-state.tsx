import { Shield, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface RoleEmptyStateProps {
  isFiltered?: boolean;
}

export function RoleEmptyState({ isFiltered = false }: RoleEmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Search className="w-12 h-12 text-gray-400" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No roles found
        </h3>

        <p className="text-gray-500 text-center mb-6 max-w-md">
          No roles match your search criteria. Try adjusting your filters or
          search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Shield className="w-12 h-12 text-gray-400" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">No roles yet</h3>

      <p className="text-gray-500 text-center mb-6 max-w-md">
        Belum ada role yang terdaftar. Klik tombol &quot;Buat Role&quot; untuk
        mulai menambahkan.
      </p>

      <Button asChild>
        <Link href="/admin/dashboard/access-control/create">Buat Role</Link>
      </Button>
    </div>
  );
}
