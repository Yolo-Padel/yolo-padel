import {
  XenditInvoiceWebhookPayload,
  ParsedWebhookData,
  XenditWebhookType,
} from "./xendit-webhook.types";

/**
 * Detect webhook type based on payload structure
 */
export function detectWebhookType(
  payload: unknown
): XenditWebhookType {
  if (!payload || typeof payload !== "object") {
    return "unknown";
  }

  const body = payload as Record<string, unknown>;

  // Invoice: has "id" and "external_id" fields directly (no wrapper)
  if (body.id && body.external_id) {
    return "invoice";
  }

  return "unknown";
}

/**
 * Parse Invoice webhook payload
 */
export function parseInvoiceWebhook(
  payload: unknown
): ParsedWebhookData | null {
  const body = payload as XenditInvoiceWebhookPayload;

  if (!body.id || !body.external_id || !body.status) {
    return null;
  }

  return {
    type: "invoice",
    paymentId: body.external_id, // external_id is our payment ID
    status: body.status,
    xenditId: body.id, // Invoice ID
    referenceId: body.external_id,
  };
}

/**
 * Parse webhook payload based on detected type
 */
export function parseWebhookPayload(
  payload: unknown
): ParsedWebhookData | null {
  const type = detectWebhookType(payload);

  if (type === "invoice") {
    return parseInvoiceWebhook(payload);
  }

  return null;
}

