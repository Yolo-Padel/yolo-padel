import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from "@getbrevo/brevo";
if (!process.env.BREVO_API_KEY) {
  throw new Error("BREVO_API_KEY is not defined in environment variables");
}

export const brevo = new TransactionalEmailsApi();
brevo.setApiKey(
  TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY,
);

// Email configuration constants
export const EMAIL_CONFIG = {
  FROM_EMAIL: process.env.FROM_EMAIL || "noreply@yourdomain.com",
  COMPANY_NAME: process.env.FROM_EMAIL || "Yolo Padel",
} as const;
