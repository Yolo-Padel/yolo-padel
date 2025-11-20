import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration constants
export const EMAIL_CONFIG = {
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
  COMPANY_NAME: process.env.COMPANY_NAME || 'Yolo Padel',
} as const;