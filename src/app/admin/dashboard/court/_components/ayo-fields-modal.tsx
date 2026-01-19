"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAyoFields, type AyoField } from "@/hooks/use-ayo-fields";
import { Search, RefreshCw, AlertCircle, Inbox } from "lucide-react";
import { toast } from "sonner";

// ════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════

interface AyoFieldsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectField: (fieldId: number) => void;
}

// ════════════════════════════════════════════════════════
// Helper Functions
// ════════════════════════════════════════════════════════

/**
 * Filters AYO fields based on search term
 * Matches against Field ID & Field Name
 *
 * Requirements: 4.2, 4.3
 */
export function filterAyoFields(
  fields: AyoField[],
  searchTerm: string,
): AyoField[] {
  if (!searchTerm.trim()) return fields;

  const term = searchTerm.toLowerCase().trim();

  return fields.filter(
    (field) =>
      field.id.toString().includes(term) ||
      field.name.toLowerCase().includes(term) ||
      field.venue_name.toLowerCase().includes(term),
  );
}

// ════════════════════════════════════════════════════════
// Sub-Components
// ════════════════════════════════════════════════════════

/**
 * Loading skeleton for the table
 * Requirements: 2.4
 */
function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex gap-4 p-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 flex-1" />
        </div>
      ))}
    </div>
  );
}

/**
 * Error state with retry button
 * Requirements: 2.6
 */
function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Failed to load AYO fields
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">{message}</p>
      <Button variant="outline" onClick={onRetry} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}

/**
 * Empty state when no results found
 * Requirements: 2.5 (implied - no results state)
 */
function EmptyState({ hasSearchTerm }: { hasSearchTerm: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {hasSearchTerm ? "No matching fields" : "No fields available"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {hasSearchTerm
          ? "Try adjusting your search term to find what you're looking for."
          : "There are no AYO fields configured in the system."}
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════════

/**
 * AYO Fields Reference Modal
 *
 * Displays a searchable table of AYO fields for reference when
 * configuring court integration settings.
 *
 * Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 4.1, 5.1, 5.2, 5.3
 */
export function AyoFieldsModal({
  open,
  onOpenChange,
  onSelectField,
}: AyoFieldsModalProps) {
  // ════════════════════════════════════════════════════════
  // State
  // ════════════════════════════════════════════════════════

  const [searchTerm, setSearchTerm] = useState("");

  // ════════════════════════════════════════════════════════
  // Data Fetching
  // ════════════════════════════════════════════════════════

  const { data, isLoading, error, refetch } = useAyoFields(open);

  // ════════════════════════════════════════════════════════
  // Computed Values
  // ════════════════════════════════════════════════════════

  /**
   * Filter fields based on search term
   * Real-time filtering as user types
   * Requirements: 4.2, 4.3, 4.4
   */
  const filteredFields = useMemo(() => {
    if (!data?.data) return [];
    return filterAyoFields(data.data, searchTerm);
  }, [data?.data, searchTerm]);

  // ════════════════════════════════════════════════════════
  // Event Handlers
  // ════════════════════════════════════════════════════════

  /**
   * Handle field row click - copies Field ID to input and closes modal
   * Requirements: 5.1, 5.2, 5.3
   */
  const handleSelectField = (field: AyoField) => {
    onSelectField(field.id);
    onOpenChange(false);
    toast.success(`Field ID ${field.id} selected`, {
      description: `${field.name}`,
    });
  };

  /**
   * Handle retry button click
   */
  const handleRetry = () => {
    refetch();
  };

  /**
   * Reset search when modal closes
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSearchTerm("");
    }
    onOpenChange(newOpen);
  };

  // ════════════════════════════════════════════════════════
  // Render
  // ════════════════════════════════════════════════════════

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              AYO Fields Reference
            </DialogTitle>
            <DialogDescription>
              Select a field to use its ID in the integration settings. Click on
              a row to select.
            </DialogDescription>
          </DialogHeader>

          {/* Search Input - Requirements: 4.1 */}
          <div className="px-6 py-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Field ID, Name, or Venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto px-6 py-4 min-h-[300px] max-h-[400px]">
            {/* Loading State - Requirements: 2.4 */}
            {isLoading && <TableSkeleton />}

            {/* Error State - Requirements: 2.6 */}
            {error && !isLoading && (
              <ErrorState
                message={
                  error instanceof Error
                    ? error.message
                    : "An unexpected error occurred"
                }
                onRetry={handleRetry}
              />
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredFields.length === 0 && (
              <EmptyState hasSearchTerm={searchTerm.trim().length > 0} />
            )}

            {/* Table - Requirements: 2.1, 2.2, 2.5 */}
            {!isLoading && !error && filteredFields.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Field ID</TableHead>
                    <TableHead>Field Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFields.map((field) => (
                    <TableRow
                      key={field.id}
                      onClick={() => handleSelectField(field)}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                    >
                      <TableCell className="font-mono font-medium">
                        {field.id}
                      </TableCell>
                      <TableCell>{field.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Footer with count */}
          {!isLoading && !error && data?.data && (
            <div className="px-6 py-3 border-t bg-muted/30 text-sm text-muted-foreground">
              {searchTerm.trim() ? (
                <>
                  Showing {filteredFields.length} of {data.data.length} fields
                </>
              ) : (
                <>{data.data.length} fields available</>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
