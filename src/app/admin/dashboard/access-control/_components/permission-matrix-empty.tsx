// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PermissionMatrixEmptyProps {}

export function PermissionMatrixEmpty() {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      Module or permission not available. Please ensure seed has been run.
      Contact developer / system administrator if problem persists.
    </div>
  );
}
