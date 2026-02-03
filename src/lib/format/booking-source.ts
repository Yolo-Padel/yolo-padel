/**
 * Maps backend booking source values to a consistent frontend display label.
 * Use this everywhere we show booking.source so the UI is consistent.
 */
export function getBookingSourceDisplayLabel(
  source: string | null | undefined,
): string {
  const trimmed = source?.trim();
  if (!trimmed) return "—";

  const normalized = trimmed.toUpperCase();

  switch (normalized) {
    case "ADMIN_MANUAL":
      return "YOLO (Admin Manual)";
    case "AYO":
      return "AYO";
    case "YOLO":
    case "YOLO SYSTEM":
    default:
      return "YOLO";
  }
}
