import { xendit } from "@/lib/xendit";
import type { CreateInvoiceRequest } from "xendit-node/invoice/models/CreateInvoiceRequest";
import type { Invoice as XenditInvoice } from "xendit-node/invoice/models/Invoice";
import config from "@/config.json";

type ServiceResponse<T> = {
  success: boolean;
  data: T | null;
  message: string;
};

export type CreateInvoiceParams = Pick<
  CreateInvoiceRequest,
  "externalId" | "amount"
> &
  Partial<Omit<CreateInvoiceRequest, "externalId" | "amount">>;

/**
 * Extract Invoice payment data from Invoice response
 * Helper function to transform Xendit response to our payment model format
 */
export const extractInvoicePaymentData = (invoice: XenditInvoice) => {
  return {
    xenditInvoiceId: invoice.id,
    xenditReferenceId: invoice.externalId,
    paymentUrl: invoice.invoiceUrl || null,
    qrString: null,
    qrImageUrl: null,
    xenditMetadata: {
      status: invoice.status,
      created: invoice.created,
      updated: invoice.updated,
      payerEmail: invoice.payerEmail,
      description: invoice.description,
      currency: invoice.currency,
      expiryDate: invoice.expiryDate,
      merchantName: invoice.merchantName,
      amount: invoice.amount,
    },
  };
};

export const xenditService = {
  /**
   * Create an invoice using Xendit's Invoice API.
   */
  createInvoice: async (
    params: CreateInvoiceParams
  ): Promise<ServiceResponse<XenditInvoice>> => {
    try {
      const { externalId, amount, currency, metadata, ...rest } = params;
      const taxAmount = config.taxPercentageDecimal * amount;
      const bookingFeeAmount = config.bookingFeePercentageDecimal * amount;
      const payload: CreateInvoiceRequest = {
        externalId,
        amount: amount + taxAmount + bookingFeeAmount,
        currency: currency ?? "IDR",
        fees: [
          {
            type: "tax",
            value: taxAmount,
          },
          {
            type: "booking fee",
            value: bookingFeeAmount,
          },
        ],
        // Ensure metadata is an object (not null) for Xendit API
        ...(metadata && typeof metadata === "object" && { metadata }),
        ...rest,
      };

      const invoice = await xendit.Invoice.createInvoice({
        data: payload,
      });

      return {
        success: true,
        data: invoice,
        message: "Invoice created successfully",
      };
    } catch (error) {
      console.error("Xendit invoice creation error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create Xendit invoice",
      };
    }
  },
};
