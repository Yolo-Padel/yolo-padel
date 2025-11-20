import { z } from "zod";

const addressSchema = z
  .object({
    country: z.string().optional(),
    streetLine1: z.string().optional(),
    streetLine2: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
  })
  .strict()
  .partial();

const customerSchema = z
  .object({
    id: z.string().optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
    givenNames: z.string().optional().nullable(),
    surname: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    mobileNumber: z.string().optional().nullable(),
    customerId: z.string().optional().nullable(),
    addresses: z.array(addressSchema).optional().nullable(),
  })
  .strict()
  .partial();

const invoiceItemSchema = z
  .object({
    name: z.string(),
    price: z.coerce.number(),
    quantity: z.coerce.number().min(0),
    referenceId: z.string().optional(),
    url: z.string().url().optional(),
    category: z.string().optional(),
  })
  .strict();

const invoiceFeeSchema = z
  .object({
    type: z.string(),
    value: z.coerce.number(),
  })
  .strict();

const channelPropertiesSchema = z
  .object({
    cards: z
      .object({
        allowedBins: z.array(z.string()).optional(),
        installmentConfiguration: z
          .object({
            allowFullPayment: z.boolean().optional(),
            allowedTerms: z
              .array(
                z
                  .object({
                    issuer: z.string().optional(),
                    terms: z.array(z.coerce.number()).optional(),
                  })
                  .strict()
              )
              .optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .partial();

const notificationChannelEnum = z.enum(["email", "sms", "whatsapp", "viber"]);

const notificationPreferenceSchema = z
  .object({
    invoiceCreated: z.array(notificationChannelEnum).optional(),
    invoiceReminder: z.array(notificationChannelEnum).optional(),
    invoicePaid: z.array(notificationChannelEnum).optional(),
  })
  .strict()
  .partial();

const urlSchema = z
  .string()
  .url("Return URL harus berupa URL valid")
  .or(z.literal(""))
  .optional()
  .transform((value) => (value === "" ? undefined : value));

export const createInvoiceSchema = z
  .object({
    externalId: z.string().min(1, "externalId wajib diisi"),
    amount: z.coerce.number().positive("amount harus lebih besar dari 0"),
    payerEmail: z.string().email().optional(),
    description: z.string().optional(),
    invoiceDuration: z.coerce.number().int().positive().optional(),
    callbackVirtualAccountId: z.string().optional(),
    shouldSendEmail: z.boolean().optional(),
    customer: customerSchema.optional(),
    customerNotificationPreference: notificationPreferenceSchema.optional(),
    successRedirectUrl: urlSchema,
    failureRedirectUrl: urlSchema,
    paymentMethods: z.array(z.string()).optional(),
    midLabel: z.string().optional(),
    shouldAuthenticateCreditCard: z.boolean().optional(),
    currency: z.string().optional(),
    reminderTime: z.coerce.number().int().positive().optional(),
    reminderTimeUnit: z.string().optional(),
    items: z.array(invoiceItemSchema).optional(),
    fees: z.array(invoiceFeeSchema).optional(),
    channelProperties: channelPropertiesSchema.optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
