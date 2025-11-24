export interface ErrorAlertProps {
  error: string | null | undefined;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  if (!error) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[#E9EAEB] p-8 text-center">
      <p className="text-red-600 font-medium mb-2">An error occurred</p>
      <p className="text-sm text-muted-foreground">{error}</p>
    </div>
  );
}
