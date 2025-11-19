import { xenditService, extractInvoicePaymentData } from "./xendit.service";
import {
  updatePaymentXenditData,
  getPaymentByOrderId,
} from "./payment.service";
import type { Invoice as XenditInvoice } from "xendit-node/invoice/models/Invoice";

type ServiceResponse<T> = {
  success: boolean;
  data: T | null;
  message: string;
};

/**
 * Create Xendit QRIS payment and update payment record
 * This function should be called after order and payment are created
 */
export async function createXenditInvoiceForOrder(
  orderId: string,
  params: {
    externalId: string;
    amount: number;
    payerEmail?: string;
    description?: string;
    invoiceDuration?: number;
    paymentMethods?: string[];
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
    items?: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
    customer?: any;
    metadata?: Record<string, unknown> | null;
  }
): Promise<ServiceResponse<XenditInvoice>> {
  try {
    // Get payment by order ID
    const payment = await getPaymentByOrderId(orderId);
    if (!payment) {
      return {
        success: false,
        data: null,
        message: "Payment not found for this order",
      };
    }

    // Create invoice via Xendit
    const xenditResult = await xenditService.createInvoice({
      externalId: params.externalId,
      amount: params.amount,
      payerEmail: params.payerEmail,
      description: params.description,
      invoiceDuration: params.invoiceDuration,
      paymentMethods: params.paymentMethods,
      successRedirectUrl: params.successRedirectUrl,
      failureRedirectUrl: params.failureRedirectUrl,
      items: params.items,
      customer: params.customer,
      // Ensure metadata is an object (not null) for Xendit API
      metadata:
        params.metadata && typeof params.metadata === "object"
          ? params.metadata
          : undefined,
    });

    console.log("XENDIT RESULT ", xenditResult);

    if (!xenditResult.success || !xenditResult.data) {
      return {
        success: false,
        data: null,
        message: xenditResult.message,
      };
    }

    // Extract payment data from Xendit response
    const xenditData = extractInvoicePaymentData(xenditResult.data);

    // Update payment record with Xendit data
    await updatePaymentXenditData(payment.id, xenditData);

    return {
      success: true,
      data: xenditResult.data,
      message: "Invoice created and payment record updated successfully",
    };
  } catch (error) {
    console.error("Create Xendit invoice error:", error);
    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create Xendit invoice",
    };
  }
}
