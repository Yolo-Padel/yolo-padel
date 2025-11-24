import { Users, Search } from "lucide-react";

interface UserEmptyStateProps {
  isFiltered: boolean;
}

export function UserEmptyState({ isFiltered }: UserEmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Search className="w-12 h-12 text-gray-400" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No users found
        </h3>

        <p className="text-gray-500 text-center mb-6 max-w-md">
          No users match your search criteria. Try adjusting your filters or
          search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Users className="w-12 h-12 text-gray-400" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">No users yet</h3>

      <p className="text-gray-500 text-center mb-6 max-w-md">
        No users have been added to the system yet. Users will appear here once
        they are invited or registered.
      </p>
    </div>
  );
}
