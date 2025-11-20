import { PaymentStatus } from "@/types/prisma";
import { ParsedWebhookData } from "./xendit-webhook.types";

/**
 * Map Xendit Invoice status to internal PaymentStatus
 */
export function mapInvoiceStatus(
  status: string,
  event?: string
): PaymentStatus | null {
  const upperStatus = status.toUpperCase();

  if (upperStatus === "PAID" || event?.includes("paid")) {
    return PaymentStatus.PAID;
  }

  if (upperStatus === "EXPIRED" || event?.includes("expired")) {
    return PaymentStatus.EXPIRED;
  }

  if (upperStatus === "FAILED" || event?.includes("failed")) {
    return PaymentStatus.FAILED;
  }

  // PENDING or other statuses - return null to ignore
  return null;
}

/**
 * Map webhook data to internal PaymentStatus
 */
export function mapWebhookStatus(
  parsedData: ParsedWebhookData
): PaymentStatus | null {
  if (parsedData.type === "invoice") {
    return mapInvoiceStatus(parsedData.status, parsedData.event);
  }

  return null;
}

