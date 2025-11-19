/**
 * Xendit Webhook Payload Types
 */

// Invoice Webhook Payload (Other Payment Methods)
export interface XenditInvoiceWebhookPayload {
  id: string;
  external_id: string;
  user_id?: string;
  is_high?: boolean;
  payment_method?: string;
  status: "PAID" | "EXPIRED" | "FAILED" | "PENDING";
  merchant_name?: string;
  amount: number;
  paid_amount?: number;
  bank_code?: string;
  paid_at?: string;
  payer_email?: string;
  description?: string;
  adjusted_received_amount?: number;
  fees_paid_amount?: number;
  updated: string;
  created: string;
  currency?: string;
  payment_channel?: string;
  payment_destination?: string;
}

/**
 * Detected webhook type
 */
export type XenditWebhookType = "invoice" | "unknown";

/**
 * Parsed webhook data
 */
export interface ParsedWebhookData {
  type: XenditWebhookType;
  paymentId: string | null;
  status: string;
  xenditId: string; // Invoice ID
  referenceId?: string;
  event?: string;
}

