// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PermissionMatrixEmptyProps {}

export function PermissionMatrixEmpty() {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      Modul atau permission belum tersedia. Pastikan seed sudah dijalankan.
    </div>
  );
}
