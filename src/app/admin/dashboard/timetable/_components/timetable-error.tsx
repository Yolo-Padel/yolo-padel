import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";

type TimetableErrorProps = {
  error?: Error | null;
  onRetry?: () => void;
  onGoHome?: () => void;
};

/**
 * Timetable Error State Component
 * Displays when timetable data fails to load
 */
export function TimetableError({
  error,
  onRetry,
  onGoHome,
}: TimetableErrorProps) {
  const errorMessage =
    error?.message || "Failed to load timetable data. Please try again.";

  const isNetworkError =
    error?.message?.toLowerCase().includes("network") ||
    error?.message?.toLowerCase().includes("fetch");

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6 border rounded-lg bg-red-50/50 dark:bg-red-950/10 min-h-[400px]">
      <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400" />

      <div className="text-center space-y-2 max-w-md">
        <h3 className="text-xl font-semibold text-red-900 dark:text-red-100">
          Error Occurred
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
        {isNetworkError && (
          <p className="text-xs text-muted-foreground mt-2">
            Please check your internet connection and try again.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="default" className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Coba Lagi
          </Button>
        )}
        {onGoHome && (
          <Button onClick={onGoHome} variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
        )}
      </div>

      {process.env.NODE_ENV === "development" && error && (
        <details className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 rounded text-xs max-w-2xl overflow-auto">
          <summary className="cursor-pointer font-semibold mb-2">
            Error Details (For Development Only)
          </summary>
          <pre className="whitespace-pre-wrap break-words">
            {error.stack || error.message}
          </pre>
        </details>
      )}
    </div>
  );
}
